import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import Emergency from '@mui/icons-material/Emergency';
import Moped from '@mui/icons-material/TwoWheeler';
import AirportShuttle from '@mui/icons-material/AirportShuttle';

// Helper to create a "Puck" style icon (Uber-like)
const createPuckIcon = (IconComponent, color) => {
    const iconHtml = ReactDOMServer.renderToString(
        <div className="custom-marker-pin">
            <div className="custom-marker-icon">
                <IconComponent style={{ fontSize: '22px', color: color }} />
            </div>
        </div>
    );

    return L.divIcon({
        html: iconHtml,
        className: 'custom-marker-container',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -25],
    });
};

// Emergency is Red
export const emergencyIcon = createPuckIcon(Emergency, '#D32F2F');


export const bodaIcon = createPuckIcon(Moped, 'black');
export const tukTukIcon = createPuckIcon(AirportShuttle, 'black');