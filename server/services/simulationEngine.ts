import { SimulationConfig, SimulationResult } from '../../src/types/index.js';

export class SimulationEngine {
  runSimulation(config: SimulationConfig): SimulationResult {
    const { transactionCount = 1000, scenario = 'NORMAL_DAY', autoExecuteHighProbability = true } = config;

    let failureRate = 0.12; // 12% baseline
    let paymentFailureWeight = 0.5;
    let checkoutWeight = 0.25;
    let subscriptionWeight = 0.15;
    let invoiceWeight = 0.1;

    switch (scenario) {
      case 'PAYMENT_FAILURE_SPIKE':
        failureRate = 0.26;
        paymentFailureWeight = 0.75;
        checkoutWeight = 0.12;
        subscriptionWeight = 0.08;
        invoiceWeight = 0.05;
        break;
      case 'SUBSCRIPTION_RENEWAL_FAILURE':
        failureRate = 0.22;
        subscriptionWeight = 0.65;
        paymentFailureWeight = 0.2;
        checkoutWeight = 0.1;
        invoiceWeight = 0.05;
        break;
      case 'CHECKOUT_ABANDONMENT_SPIKE':
        failureRate = 0.28;
        checkoutWeight = 0.68;
        paymentFailureWeight = 0.2;
        subscriptionWeight = 0.07;
        invoiceWeight = 0.05;
        break;
      case 'MIXED_REVENUE_LEAKAGE':
        failureRate = 0.31;
        paymentFailureWeight = 0.4;
        checkoutWeight = 0.3;
        subscriptionWeight = 0.2;
        invoiceWeight = 0.1;
        break;
      case 'NORMAL_DAY':
      default:
        failureRate = 0.14;
        break;
    }

    let revenueAtRisk = 0;
    let recoveryOpportunitiesDetected = 0;
    let actionsExecuted = 0;
    let successfullyRecovered = 0;

    let categoryStats = {
      FAILED_PAYMENT: { atRisk: 0, recovered: 0 },
      ABANDONED_CHECKOUT: { atRisk: 0, recovered: 0 },
      FAILED_SUBSCRIPTION: { atRisk: 0, recovered: 0 },
      OVERDUE_INVOICE: { atRisk: 0, recovered: 0 },
    };

    for (let i = 0; i < transactionCount; i++) {
      // Deterministic pseudo-randomness based on seed index & scenario
      const isFailed = ((i * 37 + 13) % 100) / 100 < failureRate;
      if (!isFailed) continue;

      // Determine Category
      const catRand = ((i * 53 + 7) % 100) / 100;
      let category: keyof typeof categoryStats = 'FAILED_PAYMENT';
      if (catRand < paymentFailureWeight) {
        category = 'FAILED_PAYMENT';
      } else if (catRand < paymentFailureWeight + checkoutWeight) {
        category = 'ABANDONED_CHECKOUT';
      } else if (catRand < paymentFailureWeight + checkoutWeight + subscriptionWeight) {
        category = 'FAILED_SUBSCRIPTION';
      } else {
        category = 'OVERDUE_INVOICE';
      }

      // Realistic amounts
      let amount = 0;
      if (category === 'FAILED_PAYMENT') {
        amount = 1200 + ((i * 193) % 8800);
      } else if (category === 'ABANDONED_CHECKOUT') {
        amount = 899 + ((i * 147) % 5200);
      } else if (category === 'FAILED_SUBSCRIPTION') {
        amount = 2999 + ((i * 389) % 15000);
      } else {
        amount = 8500 + ((i * 513) % 28000);
      }

      revenueAtRisk += amount;
      recoveryOpportunitiesDetected += 1;
      categoryStats[category].atRisk += amount;

      // Estimate Recovery Probability for this synthetic item
      let prob = 0.55;
      if (category === 'FAILED_PAYMENT') prob = 0.72 + (((i * 17) % 20) / 100);
      else if (category === 'ABANDONED_CHECKOUT') prob = 0.62 + (((i * 23) % 22) / 100);
      else if (category === 'FAILED_SUBSCRIPTION') prob = 0.68 + (((i * 31) % 25) / 100);
      else prob = 0.58 + (((i * 41) % 28) / 100);

      // Policy & Action execution
      if (autoExecuteHighProbability && prob >= 0.35) {
        actionsExecuted += 1;
        const recovered = ((i * 71 + 29) % 100) / 100 < prob;
        if (recovered) {
          successfullyRecovered += amount;
          categoryStats[category].recovered += amount;
        }
      }
    }

    const recoveryRate = revenueAtRisk > 0 ? Number(((successfullyRecovered / revenueAtRisk) * 100).toFixed(1)) : 0;

    const breakdownByCategory = [
      {
        category: 'Failed Payments',
        atRisk: categoryStats.FAILED_PAYMENT.atRisk,
        recovered: categoryStats.FAILED_PAYMENT.recovered,
        rate: categoryStats.FAILED_PAYMENT.atRisk > 0 ? Number(((categoryStats.FAILED_PAYMENT.recovered / categoryStats.FAILED_PAYMENT.atRisk) * 100).toFixed(1)) : 0,
      },
      {
        category: 'Abandoned Checkouts',
        atRisk: categoryStats.ABANDONED_CHECKOUT.atRisk,
        recovered: categoryStats.ABANDONED_CHECKOUT.recovered,
        rate: categoryStats.ABANDONED_CHECKOUT.atRisk > 0 ? Number(((categoryStats.ABANDONED_CHECKOUT.recovered / categoryStats.ABANDONED_CHECKOUT.atRisk) * 100).toFixed(1)) : 0,
      },
      {
        category: 'Failed Subscriptions',
        atRisk: categoryStats.FAILED_SUBSCRIPTION.atRisk,
        recovered: categoryStats.FAILED_SUBSCRIPTION.recovered,
        rate: categoryStats.FAILED_SUBSCRIPTION.atRisk > 0 ? Number(((categoryStats.FAILED_SUBSCRIPTION.recovered / categoryStats.FAILED_SUBSCRIPTION.atRisk) * 100).toFixed(1)) : 0,
      },
      {
        category: 'Overdue Invoices',
        atRisk: categoryStats.OVERDUE_INVOICE.atRisk,
        recovered: categoryStats.OVERDUE_INVOICE.recovered,
        rate: categoryStats.OVERDUE_INVOICE.atRisk > 0 ? Number(((categoryStats.OVERDUE_INVOICE.recovered / categoryStats.OVERDUE_INVOICE.atRisk) * 100).toFixed(1)) : 0,
      },
    ];

    return {
      id: `SIM-${Date.now()}`,
      scenario: scenario.replace(/_/g, ' '),
      transactionsAnalyzed: transactionCount,
      revenueAtRisk,
      recoveryOpportunitiesDetected,
      actionsExecuted,
      successfullyRecovered,
      recoveryRate,
      averageTimeToRecoverySeconds: 14.2,
      topRecoveredCategory: 'Failed Payments (UPI Retries)',
      topRecoveryMethod: 'Smart Delay PSP Re-routing',
      completedAt: new Date().toISOString(),
      breakdownByCategory,
    };
  }
}

export const simulationEngine = new SimulationEngine();
