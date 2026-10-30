/**
 * HTML email templates for the contact form, styled to match the site's
 * shadcn/slate theme (see `src/app/(frontend)/styles.css`) and built with
 * table-based markup + inline styles for broad email client compatibility.
 */

export interface ContactEmailArt {
  name: string
  thumbnailUrl: string | null
}

export interface ContactEmailData {
  fullname: string
  email: string
  message: string
  arts: ContactEmailArt[]
}

const COLORS = {
  pageBg: '#f1f5f9',
  cardBg: '#ffffff',
  text: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
}

const FONT_STACK = "'Lato', Arial, Helvetica, sans-serif"

const frontendHost = process.env.NEXT_PUBLIC_FRONTEND_HOST || 'https://joel-chapeau.fr'

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const renderMessage = (message: string) =>
  escapeHtml(message)
    .split('\n')
    .map((line) => line || '&nbsp;')
    .join('<br />')

const renderArts = (arts: ContactEmailArt[]) => {
  if (arts.length === 0) return ''

  return `
    <tr>
      <td style="padding: 8px 32px 0;">
        <p style="margin:0 0 16px;font-family:${FONT_STACK};font-size:14px;line-height:140%;color:${COLORS.text};">Œuvres référencées :</p>
      </td>
    </tr>
    ${arts
      .map(
        (art) => `
    <tr>
      <td style="padding: 0 32px 16px;">
        <p style="margin:0 0 8px;font-family:${FONT_STACK};font-size:14px;line-height:140%;color:${COLORS.text};">${escapeHtml(art.name)}</p>
        ${
          art.thumbnailUrl
            ? `<img src="${art.thumbnailUrl}" alt="${escapeHtml(art.name)}" width="480" style="width:100%;max-width:480px;height:auto;display:block;border:0;outline:none;text-decoration:none;" />`
            : ''
        }
      </td>
    </tr>
    <tr>
      <td style="padding: 0 32px 20px;">
        <div style="border-top:1px solid ${COLORS.border};line-height:0;font-size:0;">&nbsp;</div>
      </td>
    </tr>`,
      )
      .join('')}
  `
}

const emailLayout = (title: string, bodyHtml: string) => `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>${escapeHtml(title)}</title>
<!--[if mso]>
<style type="text/css">table, td { border-collapse: collapse; }</style>
<![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${COLORS.pageBg};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.pageBg};">
<tr>
<td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:${COLORS.cardBg};border-radius:8px;">
<tr>
<td style="padding:24px 32px;border-bottom:1px solid ${COLORS.border};">
<p style="margin:0;font-family:${FONT_STACK};font-size:13px;letter-spacing:2px;text-transform:uppercase;color:${COLORS.muted};">Joël Chapeau</p>
</td>
</tr>
${bodyHtml}
<tr>
<td style="padding:16px 32px 24px;">
<div style="border-top:1px solid ${COLORS.border};line-height:0;font-size:0;margin-bottom:16px;">&nbsp;</div>
<p style="margin:0;font-family:${FONT_STACK};font-size:12px;line-height:140%;color:${COLORS.muted};">Message envoyé depuis le formulaire de contact de <a href="${frontendHost}" style="color:${COLORS.muted};">${frontendHost.replace(/^https?:\/\//, '')}</a>.</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`

export const buildAdminNotificationEmail = (data: ContactEmailData) => {
  const subject = `Nouveau message de ${data.fullname}`

  const body = `
    <tr>
      <td style="padding: 24px 32px 0;">
        <p style="margin:0 0 16px;font-family:${FONT_STACK};font-size:14px;line-height:140%;color:${COLORS.muted};">De : ${escapeHtml(data.email)} (${escapeHtml(data.fullname)})</p>
        <p style="margin:0 0 16px;font-family:${FONT_STACK};font-size:14px;line-height:140%;color:${COLORS.text};">${escapeHtml(data.fullname)} a rempli le formulaire de contact.</p>
        <p style="margin:0 0 4px;font-family:${FONT_STACK};font-size:14px;line-height:140%;color:${COLORS.text};font-weight:bold;">Message :</p>
        <p style="margin:0 0 24px;font-family:${FONT_STACK};font-size:14px;line-height:140%;color:${COLORS.text};">${renderMessage(data.message)}</p>
      </td>
    </tr>
    ${renderArts(data.arts)}`

  return { subject, html: emailLayout(subject, body) }
}

export const buildContactConfirmationEmail = (data: Pick<ContactEmailData, 'message' | 'arts'>) => {
  const subject = 'Votre message a bien été reçu'

  const body = `
    <tr>
      <td style="padding: 24px 32px 0;">
        <p style="margin:0 0 16px;font-family:${FONT_STACK};font-size:14px;line-height:140%;color:${COLORS.text};">Merci d'avoir pris contact,<br />Je reviens vers vous dès que possible.</p>
        <p style="margin:0 0 24px;font-family:${FONT_STACK};font-size:14px;line-height:140%;color:${COLORS.text};">Joël</p>
        <p style="margin:0 0 4px;font-family:${FONT_STACK};font-size:14px;line-height:140%;color:${COLORS.text};font-weight:bold;">Message :</p>
        <p style="margin:0 0 24px;font-family:${FONT_STACK};font-size:14px;line-height:140%;color:${COLORS.text};">${renderMessage(data.message)}</p>
      </td>
    </tr>
    ${renderArts(data.arts)}`

  return { subject, html: emailLayout(subject, body) }
}
