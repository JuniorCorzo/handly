export default function CheckEmailPage() {
  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <div style={styles.icon}>✉️</div>
        <h1 style={styles.title}>Revisá tu email</h1>
        <p style={styles.description}>
          Te enviamos un enlace de acceso. Hacé click en él para ingresar al
          panel.
        </p>
        <p style={styles.hint}>
          Si no lo ves en unos minutos, revisá la carpeta de spam.
        </p>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    fontFamily: "system-ui, sans-serif",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "40px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    textAlign: "center",
  },
  icon: { fontSize: "48px", marginBottom: "16px" },
  title: { margin: "0 0 12px", fontSize: "22px", fontWeight: "700", color: "#111" },
  description: { margin: "0 0 16px", fontSize: "15px", color: "#444", lineHeight: "1.5" },
  hint: { margin: "0", fontSize: "13px", color: "#888" },
};
