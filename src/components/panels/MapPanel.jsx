import { useTranslation } from 'react-i18next'
import { MAP_ART } from '../ascii/MapArt'

export function MapPanel() {
  const { t } = useTranslation()

  return (
    <div className="map-panel">
      <pre className="ascii-art map-panel-art">{MAP_ART}</pre>
      <p>{t('map.placeholder')}</p>
    </div>
  )
}
