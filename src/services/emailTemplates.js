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
  // All contact emails go to websales — the only verified working mailbox
  const to = "websales@solution4all.dz";

  return {
    to,
    // Department info is preserved in the email body for manual routing
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

export function accountActivationEmail(activationUrl, name) {
  return {
    subject: "Activation de votre compte Solution4All",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
        <h2 style="color: #2563eb;">Bienvenue sur Solution4All !</h2>
        <p>Bonjour ${name},</p>
        <p>Un compte a été créé pour vous sur la plateforme Solution4All par un administrateur.</p>
        <p>Pour pouvoir vous connecter et définir votre mot de passe, veuillez cliquer sur le lien ci-dessous :</p>
        <p style="margin: 24px 0;">
          <a href="${activationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Activer mon compte</a>
        </p>
        <p>Ce lien est valable pour une durée de 48 heures.</p>
        <p>Si le bouton ci-dessus ne fonctionne pas, copiez-collez l'adresse suivante dans votre navigateur :</p>
        <p style="word-break: break-all; color: #6b7280;">${activationUrl}</p>
        <p>Cordialement,<br>L'équipe Solution4All</p>
      </div>`,
  };
}

export function adminLoginNotificationEmail({ name, email, loginTime, ip, userAgent }) {
  return {
    subject: `Connexion admin — ${name} (${email})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
        <h2 style="color: #b91c1c;">Connexion administrateur détectée</h2>
        <p>Une connexion à un compte administrateur vient d'avoir lieu sur la plateforme Solution4All.</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 4px 8px; font-weight: bold; width: 140px;">Administrateur:</td><td style="padding: 4px 8px;">${name}</td></tr>
          <tr><td style="padding: 4px 8px; font-weight: bold;">Email:</td><td style="padding: 4px 8px;">${email}</td></tr>
          <tr><td style="padding: 4px 8px; font-weight: bold;">Date / heure:</td><td style="padding: 4px 8px;">${loginTime}</td></tr>
          <tr><td style="padding: 4px 8px; font-weight: bold;">Adresse IP:</td><td style="padding: 4px 8px;">${ip || "Inconnue"}</td></tr>
          <tr><td style="padding: 4px 8px; font-weight: bold;">User-Agent:</td><td style="padding: 4px 8px; word-break: break-all;">${userAgent || "Inconnu"}</td></tr>
        </table>
        <p style="margin-top: 16px; color: #6b7280;">Si vous êtes à l'origine de cette connexion, aucune action n'est requise. Sinon, vérifiez immédiatement le compte.</p>
        <p>Cordialement,<br>L'équipe Solution4All</p>
      </div>`,
  };
}

export function passwordResetEmail(resetUrl, name) {
  return {
    subject: "Réinitialisation de votre mot de passe Solution4All",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
        <h2 style="color: #2563eb;">Demande de réinitialisation de mot de passe</h2>
        <p>Bonjour ${name || ""},</p>
        <p>Vous recevez cet e-mail car vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe de votre compte.</p>
        <p>Veuillez cliquer sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Réinitialiser mon mot de passe</a>
        </p>
        <p>Ce lien est valable pour une durée d'une heure. Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail.</p>
        <p>Si le bouton ci-dessus ne fonctionne pas, copiez-collez l'adresse suivante dans votre navigateur :</p>
        <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
        <p>Cordialement,<br>L'équipe Solution4All</p>
      </div>`,
  };
}

