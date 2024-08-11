/* eslint-disable react-hooks/exhaustive-deps */
// from https://github.com/bklieger-groq/stockbot-on-groq/blob/main/components/tradingview/stock-chart.tsx
'use client'

import React, { useEffect, useRef, memo } from 'react'

export function StockChart({ props: symbol }: { props: string }) {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!container.current) return
    const script = document.createElement('script')
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'light',
      style: '1',
      locale: 'en',
      backgroundColor: 'rgba(255, 255, 255, 1)',
      gridColor: 'rgba(247, 247, 247, 1)',
      withdateranges: true,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      calendar: false,
      hide_top_toolbar: true,
      support_host: 'https://www.tradingview.com'
    })

    container.current.appendChild(script)

    return () => {
      if (container.current) {
        container.current.removeChild(script)
      }
    }
  }, [symbol])

  return (
    <div style={{ height: '500px' }}>
      <div
        className="tradingview-widget-container"
        ref={container}
        style={{ height: '100%', width: '100%', position: 'relative' }}
      >
        <div
          className="tradingview-widget-container__widget"
          style={{
            height: 'calc(100% - 32px)',
            width: '100%',
            borderRadius: '1rem',
            overflow: 'hidden'
          }}
        ></div>
        <div 
          className="tradingview-widget-copyright"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '4px',
            textAlign: 'center',
            fontSize: '12px'
          }}
        >
          <a
            href="https://www.tradingview.com/"
            rel="noopener nofollow"
            target="_blank"
          >
            <span className="">Track all markets on TradingView</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default memo(StockChart)