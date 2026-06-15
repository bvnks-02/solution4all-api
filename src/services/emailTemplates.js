export function orderConfirmationEmail(order) {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name_fr}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.qty}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.unit_price_dzd.toLocaleString("fr-DZ")} DA</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(item.qty * item.unit_price_dzd).toLocaleString("fr-DZ")} DA</td>
      </tr>`
    )
    .join("");

  return {
    subject: `Confirmation de commande ${order.order_number}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Confirmation de commande</h2>
        <p>Bonjour ${order.customer_name},</p>
        <p>Votre commande <strong>${order.order_number}</strong> a été reçue avec succès.</p>
        <h3>Détails de la commande</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 8px; text-align: left;">Produit</th>
              <th style="padding: 8px; text-align: center;">Qté</th>
              <th style="padding: 8px; text-align: right;">Prix unitaire</th>
              <th style="padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Total:</td>
              <td style="padding: 8px; text-align: right; font-weight: bold;">${order.total_dzd.toLocaleString("fr-DZ")} DA</td>
            </tr>
          </tfoot>
        </table>
        <h3>Adresse de livraison</h3>
        <p>${order.customer_name}<br>${order.address}<br>${order.wilaya}</p>
        <p>Merci pour votre confiance !<br>L'équipe Solution4All</p>
      </div>`,
  };
}

export function orderNotificationEmail(order) {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name_fr}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.qty}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.unit_price_dzd.toLocaleString("fr-DZ")} DA</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(item.qty * item.unit_price_dzd).toLocaleString("fr-DZ")} DA</td>
      </tr>`
    )
    .join("");

  return {
    subject: `Nouvelle commande ${order.order_number}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Nouvelle commande reçue</h2>
        <p><strong>Commande:</strong> ${order.order_number}</p>
        <p><strong>Client:</strong> ${order.customer_name} (${order.customer_email})</p>
        ${order.customer_phone ? `<p><strong>Téléphone:</strong> ${order.customer_phone}</p>` : ""}
        ${order.customer_company ? `<p><strong>Entreprise:</strong> ${order.customer_company}</p>` : ""}
        <h3>Articles commandés</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 8px; text-align: left;">Produit</th>
              <th style="padding: 8px; text-align: center;">Qté</th>
              <th style="padding: 8px; text-align: right;">Prix unitaire</th>
              <th style="padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Total:</td>
              <td style="padding: 8px; text-align: right; font-weight: bold;">${order.total_dzd.toLocaleString("fr-DZ")} DA</td>
            </tr>
          </tfoot>
        </table>
        <h3>Livraison</h3>
        <p>${order.address}<br>${order.wilaya}</p>
        ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ""}
      </div>`,
  };
}

export function contactRoutingEmail(submission) {
  const departmentEmails = {
    general: "contact@solution4all.dz",
    commercial: "commercial@solution4all.dz",
    ecommerce: "e-commerce@solution4all.dz",
    technical: "technique@solution4all.dz",
  };

  const to = departmentEmails[submission.department] || departmentEmails.general;

  return {
    to,
    subject: `Nouveau message de contact: ${submission.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Nouveau message de contact</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 4px 8px; font-weight: bold; width: 120px;">Nom:</td><td style="padding: 4px 8px;">${submission.full_name}</td></tr>
          <tr><td style="padding: 4px 8px; font-weight: bold;">Email:</td><td style="padding: 4px 8px;">${submission.email}</td></tr>
          ${submission.phone ? `<tr><td style="padding: 4px 8px; font-weight: bold;">Téléphone:</td><td style="padding: 4px 8px;">${submission.phone}</td></tr>` : ""}
          ${submission.company ? `<tr><td style="padding: 4px 8px; font-weight: bold;">Entreprise:</td><td style="padding: 4px 8px;">${submission.company}</td></tr>` : ""}
          <tr><td style="padding: 4px 8px; font-weight: bold;">Département:</td><td style="padding: 4px 8px;">${submission.department}</td></tr>
          <tr><td style="padding: 4px 8px; font-weight: bold;">Sujet:</td><td style="padding: 4px 8px;">${submission.subject}</td></tr>
        </table>
        <h3>Message</h3>
        <p style="background: #f9fafb; padding: 12px; border-radius: 4px;">${submission.message}</p>
      </div>`,
  };
}
