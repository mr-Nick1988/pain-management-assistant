# Reporting Module (REST, SQL)

This frontend uses a REST Reporting API under `{{base_url}} = http://localhost:8080/api` with HttpOnly cookies (credentials: include).

## Endpoints

- GET `/reports/daily?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- GET `/reports/recent?limit=30`
- GET `/reports/daily/{date}`
- GET `/reports/summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- POST `/reports/daily/{date}/generate?regenerate={true|false}`
- GET `/reports/daily/{date}/export/excel`
- GET `/reports/daily/{date}/export/pdf`
- GET `/reports/export/excel?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- GET `/reports/export/pdf?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

Notes:
- All requests must send cookies. The app uses RTK Query `fetchBaseQuery` with `credentials: 'include'`.
- File downloads return `Content-Disposition` with filename; the UI parses it. If `HTTP 204`, the UI shows a friendly message.
- Dates use UTC ISO `YYYY-MM-DD` to avoid timezone off-by-one.

## UI pieces

- Reporting Dashboard: `src/components/admin/ReportingDashboard.tsx`
  - Date range selector (UTC-based)
  - Period summary + charts
  - Daily Reports table
  - Export period (Excel/PDF)
  - Generate daily report (with `regenerate`)
  - Recent Reports widget (latest 30 days)

- Recent Reports widget: `src/components/admin/reporting/RecentReportsWidget.tsx`
  - Loads `/reports/recent?limit=30`
  - Sorted by `reportDate` desc
  - Navigate to per-date view

- Daily Report view: `src/components/admin/reporting/DailyReportView.tsx`
  - Route: `/admin/reporting/daily/:date`
  - Shows a single day report with KPIs, login metrics, Top Drugs
  - Exports daily (Excel/PDF), send via email
  - 404 placeholder when not found

## Postman

Collection: `docs/reporting/reporting.postman_collection.json`

Variables:
- `base_url`: `http://localhost:8080/api`
- `startDate`, `endDate`, `date`, `limit`, `regenerate`

Tip: Enable cookies in Postman (interceptor) to pass HttpOnly cookies when testing protected endpoints.

## Dev notes

- API base: `src/api/baseQueryWithReauth.ts` (auto refresh on 401)
- API slice: `src/api/api/apiReportingSlice.ts`
- Types: `src/types/reporting.ts` (login metrics and topDrugsJson included)
