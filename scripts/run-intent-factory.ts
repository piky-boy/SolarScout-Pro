#!/usr/bin/env npx tsx
/**
 * Intent Factory CLI
 *
 * Usage examples:
 *   npx tsx scripts/run-intent-factory.ts --dry-run
 *   npx tsx scripts/run-intent-factory.ts --country RO
 *   npx tsx scripts/run-intent-factory.ts --country ES --include-tier2
 *   npx tsx scripts/run-intent-factory.ts --city bucharest --locale ro
 *   npx tsx scripts/run-intent-factory.ts --skip-hubs
 *   npx tsx scripts/run-intent-factory.ts  # live run for all countries, tier-1 only
 */

import { runFactory } from '../lib/intent-factory'
import type { FactoryOptions } from '../lib/intent-types'

// ─── Arg parser ───────────────────────────────────────────────────────────────

function parseArgs(argv: string[]): FactoryOptions {
  const args = argv.slice(2) // strip node + script path

  const dryRun = args.includes('--dry-run')
  const includeTier2 = args.includes('--include-tier2')
  const skipHubs = args.includes('--skip-hubs')

  const countryIdx = args.indexOf('--country')
  const countryCode = countryIdx !== -1 ? args[countryIdx + 1]?.toUpperCase() : undefined

  const cityIdx = args.indexOf('--city')
  const city = cityIdx !== -1 ? args[cityIdx + 1]?.toLowerCase() : undefined

  const localeIdx = args.indexOf('--locale')
  const locale = localeIdx !== -1 ? args[localeIdx + 1]?.toLowerCase() : undefined

  return { dryRun, includeTier2, skipHubs, countryCode, city, locale }
}

// ─── Formatting helpers ────────────────────────────────────────────────────────

function pad(str: string, width: number): string {
  return str.length >= width ? str : str + ' '.repeat(width - str.length)
}

function printSummary(
  results: Array<{ slug: string; action: 'created' | 'skipped' | 'error'; reason?: string }>,
  dryRun: boolean,
) {
  const created = results.filter((r) => r.action === 'created').length
  const skipped = results.filter((r) => r.action === 'skipped').length
  const errors = results.filter((r) => r.action === 'error').length

  console.log('\n' + '='.repeat(60))
  console.log('  INTENT FACTORY SUMMARY' + (dryRun ? '  [DRY RUN]' : ''))
  console.log('='.repeat(60))
  console.log(`  Total processed : ${results.length}`)
  console.log(`  Created         : ${created}`)
  console.log(`  Skipped         : ${skipped}`)
  console.log(`  Errors          : ${errors}`)
  console.log('='.repeat(60))

  if (results.length > 0) {
    console.log('\nResults:')
    console.log(
      pad('Status', 10) + pad('Slug', 60) + 'Note',
    )
    console.log('-'.repeat(90))
    for (const r of results) {
      const icon = r.action === 'created' ? '✓' : r.action === 'error' ? '✗' : '–'
      console.log(
        pad(`${icon} ${r.action}`, 10) + pad(r.slug, 60) + (r.reason ?? ''),
      )
    }
  }

  if (errors > 0) {
    process.exit(1)
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const options = parseArgs(process.argv)

  console.log('\nIntent Factory starting…')
  console.log('Options:', JSON.stringify(options, null, 2))

  if (!options.dryRun) {
    console.log('\n⚠️  LIVE RUN — changes will be written to the database.')
    console.log('   Press Ctrl+C within 3 seconds to cancel.\n')
    await new Promise((resolve) => setTimeout(resolve, 3000))
  }

  const results = await runFactory(options)
  printSummary(results, options.dryRun ?? false)
}

main().catch((err) => {
  console.error('Factory failed:', err)
  process.exit(1)
})
