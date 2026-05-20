import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import App from './cicatriz-completo'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const PRODUCTS = {
  cosmico: 'Tu Año Cósmico',
  kintsugi: 'Oráculo Kintsugi',
  '21dias': '21 Días para Bajar el Ruido'
}

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');`

function Gate({ product, productName, onAccess }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const verifyCode = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError('')

    try {
      const { data, error: dbError } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', code.trim().toUpperCase())
        .eq('product', product)
        .eq('used', false)
        .maybeSingle()

      if (dbError || !data) {
        setError('Código inválido o ya utilizado. Revisa tu correo de confirmación.')
        setLoading(false)
        return
      }

      await supabase
        .from('access_codes')
        .update({ used: true })
        .eq('id', data.id)

      sessionStorage.setItem(`cicatriz_${product}`, 'granted')
      onAccess()
    } catch (e) {
      setError('Error de conexión. Intenta nuevamente.')
    }
    setLoading(false)
  }

  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0a0a14 0%, #12101e 50%, #0d0d18 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
      padding: '24px'
    },
    card: {
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(196,168,130,0.2)',
      borderRadius: '16px',
      padding: '48px 40px',
      maxWidth: '440px',
      width: '100%',
      textAlign: 'center'
    },
    logo: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: '42px',
      color: '#C4A882',
      letterSpacing: '2px',
      marginBottom: '4px'
    },
    subtitle: {
      color: 'rgba(196,168,130,0.6)',
      fontSize: '11px',
      letterSpacing: '3px',
      textTransform: 'uppercase',
      marginBottom: '32px'
    },
    productName: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: '22px',
      color: '#f0e6d3',
      marginBottom: '8px'
    },
    desc: {
      color: 'rgba(240,230,211,0.5)',
      fontSize: '14px',
      marginBottom: '36px',
      lineHeight: '1.6'
    },
    label: {
      color: 'rgba(196,168,130,0.7)',
      fontSize: '11px',
      letterSpacing: '2px',
      textTransform: 'uppercase',
      marginBottom: '10px',
      display: 'block',
      textAlign: 'left'
    },
    input: {
      width: '100%',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(196,168,130,0.3)',
      borderRadius: '8px',
      padding: '14px 16px',
      color: '#f0e6d3',
      fontSize: '16px',
      letterSpacing: '3px',
      textTransform: 'uppercase',
      textAlign: 'center',
      outline: 'none',
      marginBottom: '16px',
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      background: 'linear-gradient(135deg, #C4A882, #a08560)',
      border: 'none',
      borderRadius: '8px',
      padding: '14px',
      color: '#0a0a14',
      fontSize: '13px',
      fontWeight: '600',
      letterSpacing: '2px',
      textTransform: 'uppercase',
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.7 : 1
    },
    error: {
      color: '#e88',
      fontSize: '13px',
      marginTop: '12px'
    },
    footer: {
      color: 'rgba(196,168,130,0.3)',
      fontSize: '11px',
      marginTop: '32px'
    }
  }

  return (
    <>
      <style>{FONTS}</style>
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.logo}>Cicatriz</div>
          <div style={styles.subtitle}>by Nanette Vezanka</div>
          <div style={styles.productName}>✦ {productName}</div>
          <div style={styles.desc}>
            Ingresa tu código de acceso para continuar.<br/>
            Lo recibiste al completar tu compra.
          </div>
          <label style={styles.label}>Código de acceso</label>
          <input
            style={styles.input}
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && verifyCode()}
            placeholder="XXXXXXXX"
            maxLength={20}
          />
          <button style={styles.button} onClick={verifyCode} disabled={loading}>
            {loading ? 'Verificando...' : 'Acceder'}
          </button>
          {error && <div style={styles.error}>{error}</div>}
          <div style={styles.footer}>cicatriz-app.vercel.app</div>
        </div>
      </div>
    </>
  )
}

function Root() {
  const params = new URLSearchParams(window.location.search)
  const product = params.get('product')
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    if (product && sessionStorage.getItem(`cicatriz_${product}`) === 'granted') {
      setHasAccess(true)
    }
  }, [product])

  if (product && PRODUCTS[product] && !hasAccess) {
    return (
      <Gate
        product={product}
        productName={PRODUCTS[product]}
        onAccess={() => setHasAccess(true)}
      />
    )
  }

  return <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />)
