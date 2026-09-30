import { useMemo, useState } from 'react'
import { useI18n } from '../i18n/useI18n'
import { CROPS, cropName } from '../utils/crops'
import { GROWING_METHODS, growingMethodLabel } from '../utils/plantings'
import { summarizeSharedRow } from '../utils/growReport'
import { MIN_REPORTS_FOR_INSIGHT, buildInsights } from '../utils/harvestInsights'
import ReportSummaryCard from './ReportSummaryCard'
import './Community.css'

const round = (value, digits) => Math.round(value * 10 ** digits) / 10 ** digits

function formatRange(min, max, digits) {
  const low = round(min, digits).toFixed(digits)
  const high = round(max, digits).toFixed(digits)
  return low === high ? low : `${low}–${high}`
}

// Decimal places per factor; see FACTORS in utils/harvestInsights.
const FINDING_DIGITS = { ph: 1, ec: 1, waterTemp: 1, soilMoisture: 0, wateringsPerWeek: 1, pests: 0 }

function findingText(t, finding) {
  const digits = FINDING_DIGITS[finding.key]
  const rest = round(finding.restAvg, Math.max(digits, 1)).toFixed(Math.max(digits, 1))
  if (finding.key === 'waterTemp') {
    // Round outward so "below 21°C" stays true for a max of 20.6.
    return t(`reports.finding.waterTemp.${finding.direction}`, {
      max: Math.ceil(finding.max),
      min: Math.floor(finding.min),
      rest,
    })
  }
  return t(`reports.finding.${finding.key}`, { range: formatRange(finding.min, finding.max, digits), rest })
}

function formatYield(t, amount, kind) {
  if (kind === 'weight') return `${amount.toFixed(1)} ${t('garden.harvest.unit.lb')}`
  return `${Math.round(amount)} ${t(`garden.harvest.unit.${kind}`)}`
}

function WhatWorkedCard({ insight }) {
  const { t, tCount, lang } = useI18n()
  return (
    <section className="community-card what-worked">
      <div className="what-worked-header">
        <span className="text-label">{t('reports.whatWorked')}</span>
        <span className="status-chip closed">{tCount('reports.basedOn', insight.sampleSize)}</span>
      </div>
      <p className="what-worked-lead">
        {t('reports.whatWorkedLead', {
          crop: cropName(insight.cropId, lang).toLowerCase(),
          method: growingMethodLabel(insight.method, lang).toLowerCase(),
        })}
      </p>
      {insight.findings.length > 0 ? (
        <ul className="what-worked-findings">
          {insight.findings.map((finding) => (
            <li key={finding.key}>{findingText(t, finding)}</li>
          ))}
        </ul>
      ) : (
        <p className="text-note">{t('reports.noPattern')}</p>
      )}
      <p className="text-note">
        {t('reports.yieldCompare', {
          top: formatYield(t, insight.topAvgYield, insight.yieldKind),
          rest: formatYield(t, insight.restAvgYield, insight.yieldKind),
        })}
      </p>
    </section>
  )
}

function HarvestReports({ sharedReports, account }) {
  const { t, tCount, lang } = useI18n()
  const [cropId, setCropId] = useState('')
  const [method, setMethod] = useState('')

  const rows = useMemo(
    () =>
      sharedReports
        .map((row) => ({ row, summary: summarizeSharedRow(row) }))
        .sort((a, b) => (a.row.sharedAt < b.row.sharedAt ? 1 : -1)),
    [sharedReports],
  )
  const filtered = rows.filter(
    ({ summary }) => (!cropId || summary.cropId === cropId) && (!method || summary.method === method),
  )
  const insights = buildInsights(filtered.map(({ summary }) => summary))
  const missing = MIN_REPORTS_FOR_INSIGHT - filtered.length

  function byline(row) {
    const name =
      account.authorId && row.authorId === account.authorId
        ? t('reports.yours')
        : t('reports.by', { name: row.anonymous || !row.authorName ? t('garden.report.anonymous') : row.authorName })
    return row.demo ? `${name} · ${t('common.demo')}` : name
  }

  return (
    <div className="harvest-reports">
      <div className="community-filters">
        <select aria-label={t('community.filter.crop')} value={cropId} onChange={(e) => setCropId(e.target.value)}>
          <option value="">{t('community.filter.allCrops')}</option>
          {CROPS.map((crop) => (
            <option key={crop.id} value={crop.id}>
              {cropName(crop.id, lang)}
            </option>
          ))}
        </select>
        <select aria-label={t('community.filter.method')} value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="">{t('community.filter.allMethods')}</option>
          {GROWING_METHODS.map((m) => (
            <option key={m} value={m}>
              {growingMethodLabel(m, lang)}
            </option>
          ))}
        </select>
      </div>

      {insights.map((insight) => (
        <WhatWorkedCard key={`${insight.cropId}|${insight.method}`} insight={insight} />
      ))}
      {cropId && method && filtered.length > 0 && missing > 0 && (
        <p className="text-note">
          {tCount('reports.needMore', missing, {
            crop: cropName(cropId, lang).toLowerCase(),
            method: growingMethodLabel(method, lang).toLowerCase(),
          })}
        </p>
      )}

      <h3 className="community-answers-heading">{tCount('reports.cardsHeading', filtered.length)}</h3>
      {filtered.length === 0 ? (
        <p className="community-empty">{t('reports.empty')}</p>
      ) : (
        <ul className="community-list">
          {filtered.map(({ row, summary }) => (
            <li key={row.id}>
              <ReportSummaryCard summary={summary} byline={byline(row)} />
            </li>
          ))}
        </ul>
      )}
      <p className="text-note">{t('reports.sharePrompt')}</p>
    </div>
  )
}

export default HarvestReports
