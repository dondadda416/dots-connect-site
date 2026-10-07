const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function response(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

function clean(value, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br>');
}

function inquiryRows(inquiry) {
  return [
    ['Name', inquiry.name],
    ['Organization', inquiry.organization],
    ['Email', inquiry.email],
    ['Phone', inquiry.phone],
    ['What they are planning', inquiry.type],
    ['Format', inquiry.format],
    ['Date', inquiry.date],
    ['Expected attendance', inquiry.participants],
    ['Notes', inquiry.help]
  ].filter(([, value]) => value);
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return response({ error: 'Method not allowed.' }, 405);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return response({ error: 'Invalid request.' }, 400);
    }

    // Quietly accept automated submissions that fill the hidden field.
    if (clean(payload.website)) return response({ ok: true });

    const inquiry = {
      name: clean(payload.name, 120),
      organization: clean(payload.org, 180),
      email: clean(payload.email, 254),
      phone: clean(payload.phone, 80),
      type: clean(payload.type, 120),
      format: clean(payload.format, 80),
      date: clean(payload.date, 20),
      participants: clean(payload.participants, 80),
      help: clean(payload.help, 2000)
    };

    if (!inquiry.name || !inquiry.organization || !EMAIL_PATTERN.test(inquiry.email)) {
      return response({ error: 'Please provide your name, organization, and a valid email address.' }, 400);
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    const recipient = process.env.CONTACT_RECIPIENT || 'sales@dataonthespot.com';

    if (!apiKey || !from) {
      console.error('The contact form email environment variables are not configured.');
      return response({ error: 'The contact form is not configured yet.' }, 503);
    }

    const rows = inquiryRows(inquiry);
    const text = [
      'New inquiry from the DOTS website',
      '',
      ...rows.map(([label, value]) => `${label}: ${value}`)
    ].join('\n');
    const html = `
      <h2>New DOTS website inquiry</h2>
      <table style="border-collapse:collapse;font-family:Arial,sans-serif;">
        ${rows.map(([label, value]) => `<tr><td style="padding:8px 16px 8px 0;font-weight:700;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:8px 0;">${escapeHtml(value)}</td></tr>`).join('')}
      </table>
    `;

    try {
      const resendResponse = await fetch(RESEND_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from,
          to: [recipient],
          reply_to: inquiry.email,
          subject: `New DOTS inquiry from ${inquiry.name}`,
          text,
          html
        })
      });

      if (!resendResponse.ok) {
        console.error('Resend rejected contact form email:', await resendResponse.text());
        return response({ error: 'Unable to send the inquiry.' }, 502);
      }
    } catch (error) {
      console.error('Contact form email failed:', error);
      return response({ error: 'Unable to send the inquiry.' }, 502);
    }

    return response({ ok: true });
  }
};
