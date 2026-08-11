// PaginaLuca.jsx
//
// CÓMO USAR ESTE ARCHIVO (guía sin jerga):
// 1. Copia este archivo completo dentro de tu proyecto, en la carpeta src/
//    (junto a cicatriz-completo.jsx), con el nombre PaginaLuca.jsx
// 2. Reemplaza el texto "PON_AQUI_TU_LINK_DE_AMAZON" (línea marcada abajo con
//    una bandera 🚩) por el link real de compra en Amazon.
// 3. Este componente NO usa Supabase ni códigos de acceso — es una página
//    simple e independiente, así que no puede romper nada de lo que ya
//    funciona en tu app.
// 4. Para mostrarlo: importa <PaginaLuca /> donde quieras que aparezca
//    (por ejemplo, cuando el usuario hace clic en "conocer a Luca" desde
//    el Home, muestra este componente en vez de la app).

export default function PaginaLuca({ onVolver }) {
  const LINK_AMAZON = "https://www.amazon.com/dp/B0H2G2JMYC"; // link limpio, sin los parámetros de rastreo del link que compartiste

  return (
    <div style={estilos.pagina}>
      <div style={estilos.header}>
        <span style={estilos.marca}>cicatriz 777</span>
        {onVolver && (
          <button onClick={onVolver} style={estilos.botonVolver}>
            ← volver
          </button>
        )}
      </div>

      <div style={estilos.contenido}>
        <p style={estilos.eyebrow}>para tu hijo</p>

        <h1 style={estilos.titulo}>Lo que Luca sentía por dentro</h1>
        <p style={estilos.subtitulo}>What Luca Felt Inside</p>

        <p style={estilos.parrafo}>
          Estalla por algo mínimo. O se queda callado y no sabes qué le pasa.
        </p>

        <p style={estilos.parrafo}>
          Hay niños que sienten mucho y no saben cómo decirlo. A veces sienten
          demasiado; otras veces, nada. Y desde afuera es difícil saber cómo
          acompañarlos.
        </p>

        <p style={estilos.parrafo}>
          Luca tiene 11 años y le pasa justo eso. A través de sus aventuras
          junto a su perro Bruno, tu hijo se va a reconocer — y por primera
          vez va a sentir que lo que le pasa tiene nombre, y que no está
          solo.
        </p>

        <p style={estilos.parrafo}>
          Este libro bilingüe (español/inglés) acompaña a niños de 9 a 13
          años a reconocer, nombrar y regular sus emociones, con ternura y
          sin presión. Incluye una página para colorear y un espacio para
          escribir la palabra que el niño elija: simple, suyo.
        </p>

        <p style={estilos.cierre}>
          Para niños que sienten mucho y no saben cómo decirlo.
          <br />
          Para los adultos que quieren acompañarlos mejor.
        </p>

        <a
          href={LINK_AMAZON}
          target="_blank"
          rel="noopener noreferrer"
          style={estilos.botonComprar}
        >
          conocer el libro en Amazon →
        </a>

        <p style={estilos.nota}>
          por Nane Merello Pinilla · edad de lectura: 9–13 años
        </p>
      </div>

      <div style={estilos.footer}>
        <p style={estilos.footerTexto}>cicatriz 777 · antofagasta, chile</p>
      </div>
    </div>
  );
}

const estilos = {
  pagina: {
    background: "#110d08",
    minHeight: "100vh",
    fontFamily: "sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 28px",
    borderBottom: "1px solid rgba(245,236,215,0.1)",
  },
  marca: {
    color: "#F5ECD7",
    fontSize: "15px",
    fontWeight: 500,
    letterSpacing: "0.5px",
  },
  botonVolver: {
    background: "none",
    border: "none",
    color: "#D4AF70",
    fontSize: "13px",
    cursor: "pointer",
  },
  contenido: {
    maxWidth: "560px",
    margin: "0 auto",
    padding: "56px 28px 40px",
  },
  eyebrow: {
    color: "#D4AF70",
    fontSize: "12px",
    letterSpacing: "1px",
    textTransform: "uppercase",
    marginBottom: "12px",
  },
  titulo: {
    color: "#F5ECD7",
    fontSize: "26px",
    fontWeight: 500,
    lineHeight: 1.3,
    margin: "0 0 4px",
  },
  subtitulo: {
    color: "#F5ECD7",
    opacity: 0.5,
    fontSize: "15px",
    fontStyle: "italic",
    margin: "0 0 32px",
  },
  parrafo: {
    color: "#F5ECD7",
    opacity: 0.85,
    fontSize: "15px",
    lineHeight: 1.7,
    margin: "0 0 18px",
  },
  cierre: {
    color: "#F5ECD7",
    fontSize: "15px",
    lineHeight: 1.7,
    fontWeight: 500,
    margin: "28px 0 32px",
  },
  botonComprar: {
    display: "inline-block",
    border: "1px solid rgba(212,175,112,0.5)",
    borderRadius: "6px",
    padding: "12px 24px",
    color: "#D4AF70",
    fontSize: "14px",
    textDecoration: "none",
  },
  nota: {
    color: "#F5ECD7",
    opacity: 0.4,
    fontSize: "12px",
    marginTop: "20px",
  },
  footer: {
    padding: "16px 28px",
    borderTop: "1px solid rgba(245,236,215,0.08)",
    textAlign: "center",
  },
  footerTexto: {
    color: "#F5ECD7",
    opacity: 0.35,
    fontSize: "11px",
    margin: 0,
  },
};
