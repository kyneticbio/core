import type { ConditionDef } from "../types";

/**
 * MTHFR (Methylenetetrahydrofolate reductase)
 *
 * MTHFR converts 5,10-methylenetetrahydrofolate to 5-methyltetrahydrofolate (methylfolate),
 * which is essential for methylation reactions including neurotransmitter synthesis.
 * The C677T polymorphism (rs1801133) significantly affects enzyme activity and
 * downstream BH4 availability, impacting catecholamine and serotonin synthesis.
 */
export const mthfr: ConditionDef = {
  key: 'mthfr',
  category: 'genetic',
  label: 'MTHFR (C677T)',
  description: {
    physiology:
      'MTHFR is critical for folate metabolism and methylation. Reduced activity impairs ' +
      'BH4 regeneration, which is a cofactor for tyrosine hydroxylase (dopamine/NE synthesis) ' +
      'and tryptophan hydroxylase (serotonin synthesis).',
    application:
      'Select your genotype (rs1801133) to model baseline neurotransmitter synthesis capacity ' +
      'and methylation efficiency.',
    references: [
      'Frosst et al. (1995)',
      'Gilbody et al. (2007)',
      'Miller (2008)',
    ],
  },
  params: [
    {
      key: 'genotype',
      label: 'Genotype (rs1801133)',
      type: 'select',
      options: [
        {
          label: 'CC (Normal)',
          value: 0.0,  // No reduction in enzyme activity
          description: 'Full enzyme activity. Normal methylation.',
          rsid: 'rs1801133(G;G)'
        },
        {
          label: 'CT (Heterozygous)',
          value: 0.50,  // ~50% of the effect (35% reduced activity)
          description: '~35% reduced activity. Mildly impaired methylation.',
          rsid: 'rs1801133(A;G)'
        },
        {
          label: 'TT (Homozygous)',
          value: 1.0,  // Full effect (70% reduced activity)
          description: '~70% reduced activity. Significantly impaired methylation.',
          rsid: 'rs1801133(A;A)'
        }
      ],
      default: 0.0,
    },
  ],
  enzymeModifiers: [
    {
      enzyme: 'MTHFR',
      paramKey: 'genotype',
      activity: -0.70  // At TT (value=1.0): -70% enzyme activity
    },
  ],
  // Reduced MTHFR → reduced BH4 → reduced TH/TPH activity → lower monoamine synthesis
  signalModifiers: [
    {
      key: 'serotonin',
      paramKey: 'genotype',
      baseline: {
        // Lower genotype value = lower baseline serotonin synthesis
        // At TT (0.30): -0.15 amplitude reduction
        amplitudeGain: -0.15,
      }
    },
    {
      key: 'dopamine',
      paramKey: 'genotype',
      baseline: {
        // At TT (0.30): -0.10 amplitude reduction (less affected than serotonin)
        amplitudeGain: -0.10,
      }
    },
  ],
};
