import nodemailer from "nodemailer";

const configs = [
  // Original .env creds - exact match
  { label: "solutionadmin@solution4all.dz / solutionadmin@2 (465/secure)", host: "smtp.solution4all.dz", port: 465, secure: true, user: "solutionadmin@solution4all.dz", pass: "solutionadmin@2" },
  // Try just the local part as username
  { label: "solutionadmin / solutionadmin@2 (465/secure)", host: "smtp.solution4all.dz", port: 465, secure: true, user: "solutionadmin", pass: "solutionadmin@2" },
  // Try websales with solutionadmin@2 password
  { label: "websales@solution4all.dz / solutionadmin@2 (465/secure)", host: "smtp.solution4all.dz", port: 465, secure: true, user: "websales@solution4all.dz", pass: "solutionadmin@2" },
  // Try websales local part
  { label: "websales / solutionadmin@2 (465/secure)", host: "smtp.solution4all.dz", port: 465, secure: true, user: "websales", pass: "solutionadmin@2" },
  // Port 587 variants
  { label: "solutionadmin@solution4all.dz / solutionadmin@2 (587/STARTTLS)", host: "smtp.solution4all.dz", port: 587, secure: false, user: "solutionadmin@solution4all.dz", pass: "solutionadmin@2" },
  { label: "websales@solution4all.dz / solutionadmin@2 (587/STARTTLS)", host: "smtp.solution4all.dz", port: 587, secure: false, user: "websales@solution4all.dz", pass: "solutionadmin@2" },
];

for (const cfg of configs) {
  console.log(`\n--- ${cfg.label} ---`);
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
    logger: true,
    debug: true,
  });

  try {
    await transporter.verify();
    console.log(`✅ AUTH OK!`);

    const info = await transporter.sendMail({
      from: cfg.user,
      to: "websales@solution4all.dz",
      subject: "SMTP Test — solution4all",
      html: `<h2>SMTP Test Successful</h2><p>Sent from <strong>${cfg.user}</strong> at ${new Date().toISOString()}</p>`,
      text: `SMTP Test Successful — Sent from ${cfg.user} at ${new Date().toISOString()}`,
    });

    console.log(`✅ Email sent! Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    transporter.close();
    break;
  } catch (error) {
    console.log(`❌ ${error.message} (code: ${error.code || "N/A"})`);
  } finally {
    try { transporter.close(); } catch {}
  }
}