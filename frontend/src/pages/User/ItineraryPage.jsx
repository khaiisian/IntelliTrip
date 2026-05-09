import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { generateItinerary, saveItinerary, getSavedItinerary, recalculateItinerary } from '../../api/itinerary.api';
import { getRouteGeometry } from '../../api/route.api';
import jsPDF from 'jspdf';

const createNumberedIcon = (number) => {
    return L.divIcon({
        className: 'custom-number-icon',
        html: `
            <div style="
                background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
                color: white;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: bold;
                border: 2px solid white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                backdrop-filter: blur(2px);
            ">
                ${number}
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    });
};

const GroupedPopup = ({ attractions }) => {
    return (
        <div className="p-3 max-w-xs rounded-xl bg-white/95 backdrop-blur-sm shadow-xl">
            <div className="font-bold mb-2 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A8A]"></span>
                📍 {attractions.length} attraction{attractions.length > 1 ? 's' : ''} at this location
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto custom-scroll">
                {attractions.map((att, idx) => (
                    <div key={idx} className="border-t border-gray-100 pt-2 text-xs first:border-t-0 first:pt-0">
                        <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A] text-xs font-bold">
                                {att.originalIndex + 1}
                            </span>
                            {att.attraction_name}
                        </div>
                        <div className="text-gray-500 ml-6 mt-0.5">
                            {att.visit_start_time} – {att.visit_end_time}
                            {att.duration_minutes && ` (${att.duration_minutes} min)`}
                        </div>
                        {att.final_score > 0 && (
                            <div className="text-gray-500 ml-6 mt-0.5">
                                Score: {att.final_score.toFixed(2)}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const createStartIcon = () => {
    return L.divIcon({
        className: 'custom-start-icon',
        html: `
            <div style="
                background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                color: white;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: bold;
                border: 2px solid white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            ">
                S
            </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
    });
};

const createEndIcon = () => {
    return L.divIcon({
        className: 'custom-end-icon',
        html: `
            <div style="
                background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
                color: white;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: bold;
                border: 2px solid white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            ">
                E
            </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
    });
};

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper component for stat cards
const StatCard = ({ label, value, icon, gradient = 'from-[#1E3A8A] to-[#2563EB]' }) => (
    <div className="group bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100/50 hover:border-[#1E3A8A]/20 hover:-translate-y-1">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {icon}
                </svg>
            </div>
        </div>
        <div className="mt-3 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-[#1E3A8A]/20 to-transparent transition-all duration-300 rounded-full"></div>
    </div>
);

// Helper component for day tabs
const DayTab = ({ day, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`relative px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
            isActive
                ? 'bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white shadow-lg shadow-[#1E3A8A]/20'
                : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white border border-gray-200'
        }`}
    >
        Day {day}
        {isActive && (
            <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/60"></span>
        )}
    </button>
);

export const TripItineraryPage = () => {
    const { tripCode } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const mode = searchParams.get('mode') || 'generate';
    const cameFromTripDetail = location.state?.fromTripDetail === true;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [itineraryData, setItineraryData] = useState(null);
    const [workingItinerary, setWorkingItinerary] = useState([]);
    const [selectedDay, setSelectedDay] = useState('1');
    const [routeGeometry, setRouteGeometry] = useState([]);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState('');
    const [exportingPDF, setExportingPDF] = useState(false);
    const [isPreviewValid, setIsPreviewValid] = useState(true);
    const [previewErrors, setPreviewErrors] = useState([]);
    const [freeTimeGaps, setFreeTimeGaps] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [recalcLoadingItem, setRecalcLoadingItem] = useState(null);
    const [recalcError, setRecalcError] = useState('');
    const [lockedItems, setLockedItems] = useState([]);
    const [changeDayFor, setChangeDayFor] = useState(null);
    const [changeDayValues, setChangeDayValues] = useState({ newDay: '1', newPosition: '0' });
    const [editTimeFor, setEditTimeFor] = useState(null);
    const [editStartValue, setEditStartValue] = useState('');
    const [editDurationValue, setEditDurationValue] = useState('');
    const [showFillForGap, setShowFillForGap] = useState(null);

    const workingByDay = useMemo(() => {
        const grouped = {};
        workingItinerary.forEach((item) => {
            const day = String(item.day_number ?? 1);
            grouped[day] = grouped[day] || [];
            grouped[day].push(item);
        });
        Object.values(grouped).forEach((items) => {
            items.sort((a, b) => new Date(a.visit_start_time) - new Date(b.visit_start_time));
        });
        return grouped;
    }, [workingItinerary]);

    useEffect(() => {
        const days = Object.keys(workingByDay);
        if (days.length && !days.includes(selectedDay)) {
            setSelectedDay(days[0]);
        }
    }, [workingByDay, selectedDay]);

    // 1. Fetch the generated itinerary or saved itinerary based on mode
    useEffect(() => {
        const fetchItinerary = async () => {
            try {
                setLoading(true);
                let res;
                if (mode === 'generate') {
                    res = await generateItinerary(tripCode);
                    console.log('📦 GENERATED data:', res.data.data);
                } else {
                    res = await getSavedItinerary(tripCode);
                    console.log('📦 SAVED data:', res.data.data);
                }

                const payload = res.data.data;
                setItineraryData(payload);
                setLockedItems(payload.lockedItems || payload.locked_items || []);
                setIsPreviewValid(true);
                setPreviewErrors([]);
                setFreeTimeGaps([]);
                setSuggestions([]);

                const flatItinerary = Object.keys(payload.byDay || {}).flatMap((day) => {
                    return (payload.byDay[day] || []).map((item, index) => ({
                        ...item,
                        day_number: Number(day),
                        item_code: item.item_code || `item-${item.attraction_id || item.id || `${day}-${index}`}`
                    }));
                });

                setWorkingItinerary(flatItinerary);
                setSelectedDay(flatItinerary.length ? String(flatItinerary[0]?.day_number || 1) : '1');
            } catch (err) {
                console.error('Error fetching itinerary:', err);
                setError(err?.response?.data?.message || `Failed to ${mode === 'generate' ? 'generate' : 'load'} itinerary`);
            } finally {
                setLoading(false);
            }
        };
        fetchItinerary();
    }, [tripCode, mode]);

    useEffect(() => {
        if (!itineraryData) {
            setRouteGeometry([]);
            return;
        }

        const currentDayAttractions = workingByDay[selectedDay] || [];
        const startLat = parseFloat(itineraryData.trip?.start_lat);
        const startLng = parseFloat(itineraryData.trip?.start_lng);
        const endLat = parseFloat(itineraryData.trip?.end_lat);
        const endLng = parseFloat(itineraryData.trip?.end_lng);

        const hasValidStart = !isNaN(startLat) && !isNaN(startLng);
        const hasValidEnd = !isNaN(endLat) && !isNaN(endLng);

        const polylinePositions = currentDayAttractions
            .filter(att => {
                const lat = parseFloat(att.latitude);
                const lng = parseFloat(att.longitude);
                return !isNaN(lat) && !isNaN(lng);
            })
            .map(att => [parseFloat(att.latitude), parseFloat(att.longitude)]);

        let fullPolylinePositions = [];
        if (hasValidStart) {
            fullPolylinePositions.push([startLat, startLng]);
        }
        fullPolylinePositions.push(...polylinePositions);

        if (hasValidEnd) {
            const lastAttraction = polylinePositions.length > 0
                ? polylinePositions[polylinePositions.length - 1]
                : null;
            const isEndSameAsLast = lastAttraction &&
                Math.abs(lastAttraction[0] - endLat) < 0.000001 &&
                Math.abs(lastAttraction[1] - endLng) < 0.000001;
            if (!isEndSameAsLast) {
                fullPolylinePositions.push([endLat, endLng]);
            }
        }

        const uniquePolyline = [];
        for (let i = 0; i < fullPolylinePositions.length; i++) {
            if (i === 0) {
                uniquePolyline.push(fullPolylinePositions[i]);
            } else {
                const prev = fullPolylinePositions[i - 1];
                const curr = fullPolylinePositions[i];
                if (prev[0] !== curr[0] || prev[1] !== curr[1]) {
                    uniquePolyline.push(curr);
                }
            }
        }

        const fetchRoute = async () => {
            if (uniquePolyline.length < 2) {
                setRouteGeometry([]);
                return;
            }

            const coords = uniquePolyline.map(p => [p[1], p[0]]);
            const result = await getRouteGeometry(coords);
            setRouteGeometry(result || []);
        };

        fetchRoute();
    }, [selectedDay, itineraryData, workingByDay]);

    // Helper functions
    const getDuration = (start, end) => {
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        return (eh * 60 + em) - (sh * 60 + sm);
    };

    const getItemCode = (item) => item.item_code || item.id || item.attraction_id || '';

    const handleRecalculateMove = async (itemCode, newDay, newPosition) => {
        if (recalcLoadingItem || !tripCode) return;
        const currentDay = Number(workingItinerary.find(it => getItemCode(it) === itemCode)?.day_number ?? newDay);
        if (currentDay === newDay) {
            const currentIndex = (workingByDay[String(currentDay)] || []).findIndex(it => getItemCode(it) === itemCode);
            if (currentIndex === newPosition) {
                setChangeDayFor(null);
                return;
            }
        }

        const action = {
            type: 'move',
            itemCode,
            newDay,
            newPosition
        };

        setRecalcError('');
        setRecalcLoadingItem(itemCode);

        try {
            const res = await recalculateItinerary(tripCode, {
                currentItinerary: workingItinerary,
                action,
                lockedItems
            });

            const payload = res.data.data || {};
            const updatedItinerary = payload.recalculatedItinerary || workingItinerary;
            const normalized = updatedItinerary.map((item) => ({
                ...item,
                day_number: Number(item.day_number ?? item.day ?? 1)
            }));

            setWorkingItinerary(normalized);
            setItineraryData((prev) => prev ? { ...prev, summary: { ...prev.summary, ...payload.totals } } : prev);
            setIsPreviewValid(payload.isValid !== false);
            setPreviewErrors(payload.errors || []);
            setFreeTimeGaps(payload.freeTimeGaps || []);
            setSuggestions(payload.suggestions || []);

            if (payload.errors && payload.errors.length) {
                setRecalcError(payload.errors.join(' • '));
            }
        } catch (err) {
            console.error('Recalculate error:', err);
            setRecalcError(err?.response?.data?.message || 'Failed to recalculate itinerary');
        } finally {
            setRecalcLoadingItem(null);
            setChangeDayFor(null);
        }
    };

    const handleOpenChangeDay = (itemCode) => {
        setChangeDayFor(itemCode);
        setChangeDayValues({ newDay: selectedDay, newPosition: '0' });
    };

    const handleRecalculateDelete = async (itemCode) => {
        if (recalcLoadingItem || !tripCode) return;

        const action = {
            type: 'delete',
            itemCode
        };

        setRecalcError('');
        setRecalcLoadingItem(itemCode);

        try {
            const res = await recalculateItinerary(tripCode, {
                currentItinerary: workingItinerary,
                action,
                lockedItems
            });

            const payload = res.data.data || {};
            const updatedItinerary = payload.recalculatedItinerary || workingItinerary;
            const normalized = updatedItinerary.map((item) => ({
                ...item,
                day_number: Number(item.day_number ?? item.day ?? 1)
            }));

            setWorkingItinerary(normalized);
            setItineraryData((prev) => prev ? { ...prev, summary: { ...prev.summary, ...payload.totals } } : prev);
            setIsPreviewValid(payload.isValid !== false);
            setPreviewErrors(payload.errors || []);
            setFreeTimeGaps(payload.freeTimeGaps || []);
            setSuggestions(payload.suggestions || []);

            if (payload.errors && payload.errors.length) {
                setRecalcError(payload.errors.join(' • '));
            }
        } catch (err) {
            console.error('Delete error:', err);
            setRecalcError(err?.response?.data?.message || 'Failed to delete attraction');
        } finally {
            setRecalcLoadingItem(null);
        }
    };

    const handleOpenEditTime = (itemCode, currentStartTime, currentDuration) => {
        if (recalcLoadingItem) return;
        setEditTimeFor(itemCode);
        setEditStartValue(currentStartTime || '');
        setEditDurationValue(currentDuration?.toString() || '');
    };

    const handleApplyEditTime = async (itemCode) => {
        const hasStartChange = editStartValue && editStartValue !== '';
        const hasDurationChange = editDurationValue && !isNaN(parseInt(editDurationValue, 10));
        if ((!hasStartChange && !hasDurationChange) || recalcLoadingItem) return;

        const action = { type: 'editTime', itemCode };
        if (hasStartChange) action.newStartTime = editStartValue;
        if (hasDurationChange) action.newDuration = parseInt(editDurationValue, 10);

        setRecalcError('');
        setRecalcLoadingItem(itemCode);

        try {
            const res = await recalculateItinerary(tripCode, {
                currentItinerary: workingItinerary,
                action,
                lockedItems
            });

            const payload = res.data.data || {};
            const updatedItinerary = payload.recalculatedItinerary || workingItinerary;
            const normalized = updatedItinerary.map((item) => ({
                ...item,
                day_number: Number(item.day_number ?? item.day ?? 1)
            }));

            setWorkingItinerary(normalized);
            setItineraryData((prev) => prev ? { ...prev, summary: { ...prev.summary, ...payload.totals } } : prev);
            setIsPreviewValid(payload.isValid !== false);
            setPreviewErrors(payload.errors || []);
            setFreeTimeGaps(payload.freeTimeGaps || []);
            setSuggestions(payload.suggestions || []);

            if (payload.errors && payload.errors.length) {
                setRecalcError(payload.errors.join(' • '));
            }
        } catch (err) {
            console.error('Edit time error:', err);
            setRecalcError(err?.response?.data?.message || 'Failed to edit time');
        } finally {
            setRecalcLoadingItem(null);
            setEditTimeFor(null);
            setEditStartValue('');
            setEditDurationValue('');
        }
    };

    const handleCancelEditTime = () => {
        setEditTimeFor(null);
        setEditStartValue('');
        setEditDurationValue('');
    };

    const handleToggleLock = (itemCode) => {
        if (recalcLoadingItem) return;
        setLockedItems(prev => 
            prev.includes(itemCode) 
                ? prev.filter(code => code !== itemCode) 
                : [...prev, itemCode]
        );
        // No immediate recalc required when toggling lock in UI
    };

    const handleFillGap = (gap, options, gapIndex) => {
        setShowFillForGap({ gap, options, gapIndex });
    };

    const handleSelectSuggestion = async (gap, option) => {
        if (recalcLoadingItem || !tripCode) return;

        const action = {
            type: 'add',
            targetDay: gap.day,
            proposedStart: option.proposedStart,
            suggestion: {
                attraction_id: option.attraction_id,
                name: option.name,
                duration_minutes: option.duration,
                cost: option.cost,
                latitude: option.latitude,
                longitude: option.longitude,
                base_score: option.score
            }
        };

        setRecalcError('');
        setRecalcLoadingItem(`add-${gap.day}-${option.attraction_id}`);

        try {
            const res = await recalculateItinerary(tripCode, {
                currentItinerary: workingItinerary,
                action,
                lockedItems
            });

            const payload = res.data.data || {};
            const updatedItinerary = payload.recalculatedItinerary || workingItinerary;
            const normalized = updatedItinerary.map((item) => ({
                ...item,
                day_number: Number(item.day_number ?? item.day ?? 1)
            }));

            setWorkingItinerary(normalized);
            setItineraryData((prev) => prev ? { ...prev, summary: { ...prev.summary, ...payload.totals } } : prev);
            setIsPreviewValid(payload.isValid !== false);
            setPreviewErrors(payload.errors || []);
            setFreeTimeGaps(payload.freeTimeGaps || []);
            setSuggestions(payload.suggestions || []);

            if (payload.errors && payload.errors.length) {
                setRecalcError(payload.errors.join(' • '));
            }
            setShowFillForGap(null);
        } catch (err) {
            console.error('Add suggestion error:', err);
            setRecalcError(err?.response?.data?.message || 'Failed to insert suggestion');
        } finally {
            setRecalcLoadingItem(null);
        }
    };

    const handleChangeDayInput = (field, value) => {
        setChangeDayValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleApplyChangeDay = async (itemCode) => {
        const newDay = Number(changeDayValues.newDay);
        const targetDayItems = workingByDay[String(newDay)] || [];
        const maxPosition = targetDayItems.length;
        const parsedPosition = Math.max(0, Math.min(maxPosition, Number(changeDayValues.newPosition)));
        await handleRecalculateMove(itemCode, newDay, parsedPosition);
    };

    const handleCancelChangeDay = () => {
        setChangeDayFor(null);
    };

    const handleSaveItinerary = async () => {
        if (!itineraryData) return;

        setSaving(true);
        setSaveError('');
        setSaveSuccess('');

        try {
            const itinerary = Object.keys(workingByDay).flatMap((day) => {
                const dayNumber = Number(day);
                return workingByDay[day].map((att) => ({
                    day_number: dayNumber,
                    attraction_id: att.attraction_id ?? att.id ?? null,
                    visit_start_time: att.visit_start_time ?? '',
                    visit_end_time: att.visit_end_time ?? '',
                    distance_from_previous: Number(att.distance_from_previous) || 0,
                    final_score: Number(att.final_score) || 0,
                    cost: Number(att.cost) || 0,
                }));
            });

            if (itinerary.length === 0) {
                setSaveError('No itinerary items available to save.');
                return;
            }

            const payload = {
                itinerary,
                total_cost: Number(itineraryData.summary?.totalCost) || 0,
            };

            await saveItinerary(tripCode, payload);
            setSaveSuccess('Itinerary saved successfully.');

            // ✅ Navigate to view mode after successful save
            // Optional: add a short delay to let the user see the success message
            setTimeout(() => {
                navigate(`/trip/${tripCode}/itinerary?mode=view`, { state: { fromTripDetail: cameFromTripDetail } });
            }, 1500); // 1.5 seconds delay – adjust as needed

        } catch (err) {
            console.error('Error saving itinerary:', err);
            setSaveError(err?.response?.data?.message || 'Failed to save itinerary');
        } finally {
            setSaving(false);
        }
    };

const handleExportPDF = async () => {
    if (!itineraryData) return;
    setExportingPDF(true);

    try {
        const trip = itineraryData.trip || {};
        const summary = itineraryData.summary || {};

        // Helper to parse numeric value from string (e.g., "16.3 km" -> 16.3)
        const parseNumeric = (value, defaultValue = 0) => {
            if (value === undefined || value === null) return defaultValue;
            if (typeof value === 'number') return isNaN(value) ? defaultValue : value;
            const num = parseFloat(value);
            return isNaN(num) ? defaultValue : num;
        };

        const totalDistance = parseNumeric(summary.totalDistance, 0);
        const totalTravelTime = parseNumeric(summary.totalTravelTime, 0);
        const totalCost = parseNumeric(summary.totalCost, 0);
        const totalAttractions = parseNumeric(summary.totalAttractions, 0);

        const safeNumber = (value, defaultValue = 0) => parseNumeric(value, defaultValue);

        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MMK', minimumFractionDigits: 0 }).format(amount);
        };

        // Create main container that fills the PDF width
        const pdfContainer = document.createElement('div');
        pdfContainer.style.width = '100%';
        pdfContainer.style.padding = '0';
        pdfContainer.style.margin = '0';
        pdfContainer.style.backgroundColor = 'white';
        pdfContainer.style.fontFamily = 'Arial, sans-serif';
        pdfContainer.style.display = 'flex';
        pdfContainer.style.justifyContent = 'center'; // centers inner wrapper

        // Inner wrapper with fixed width and margin auto to center horizontally
        const innerWrapper = document.createElement('div');
        innerWrapper.style.width = '170mm';
        innerWrapper.style.margin = '0 auto';
        innerWrapper.style.padding = '0';

        // Styles
        const style = document.createElement('style');
        style.textContent = `
            .pdf-header { 
                margin: 10mm 0 25px 0;
                background-color: #1E3A8A; 
                color: white; 
                padding: 25px; 
                border-radius: 10px; 
                text-align: center; 
            }
            .stats-row { 
                display: flex; 
                justify-content: center; 
                gap: 10px;
                margin: 0 0 30px 0;
            }
            .stat-card { 
                flex: 1;
                border: 1px solid #e5e7eb; 
                padding: 12px; 
                text-align: center; 
                border-radius: 8px; 
            }
            .itinerary-content {
                margin: 0;
            }
            .day-header { 
                font-size: 18pt; 
                color: #1E3A8A; 
                border-bottom: 2px solid #1E3A8A; 
                margin: 20px 0 15px 0; 
                padding-bottom: 5px; 
            }
            .attraction-item { 
                page-break-inside: avoid; 
                margin-bottom: 12px; 
                padding: 18px; 
                border: 1px solid #f3f4f6; 
                background-color: #f9fafb; 
                border-radius: 8px; 
            }
            .attraction-name { 
                font-size: 13pt; 
                font-weight: bold; 
                color: #111827; 
                margin-bottom: 10px; 
            }
            .info-table { 
                display: flex;
                justify-content: space-between;
                width: 100%;
            }
            .info-column {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            .info-cell { 
                font-size: 10pt; 
                color: #4b5563; 
            }
            .label { font-weight: bold; color: #374151; margin-right: 5px; }
        `;
        pdfContainer.appendChild(style);

        // Build HTML for days and attractions
        const byDay = workingByDay;
        const days = Object.keys(byDay).sort((a, b) => Number(a) - Number(b));
        let daysHtml = '';

        for (const dayKey of days) {
            const attractions = byDay[dayKey] || [];
            daysHtml += `<div class="day-header">Day ${dayKey}</div>`;
            for (let idx = 0; idx < attractions.length; idx++) {
                const attr = attractions[idx];
                daysHtml += `
                    <div class="attraction-item">
                        <div class="attraction-name">${idx + 1}. ${attr.attraction_name}</div>
                        <div class="info-table">
                            <div class="info-column">
                                <div class="info-cell"><span class="label">Time:</span> ${attr.visit_start_time} - ${attr.visit_end_time}</div>
                                <div class="info-cell"><span class="label">Distance:</span> ${safeNumber(attr.distance_from_previous).toFixed(2)} km</div>
                            </div>
                            <div class="info-column">
                                <div class="info-cell"><span class="label">Duration:</span> ${attr.duration_minutes || 0} min</div>
                                <div class="info-cell"><span class="label">Travel Time:</span> ${attr.travel_minutes || 0} min</div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        // Set inner HTML of the centered wrapper
        innerWrapper.innerHTML = `
            <div class="pdf-header">
                <h1 style="margin: 0; font-size: 24pt;">${trip.trip_name || 'Trip Itinerary'}</h1>
                <p style="margin: 8px 0 0 0; font-size: 12pt; opacity: 0.9;">
                    ${trip.start_date ? new Date(trip.start_date).toLocaleDateString() : ''} - 
                    ${trip.end_date ? new Date(trip.end_date).toLocaleDateString() : ''}
                </p>
            </div>

            <div class="stats-row">
                <div class="stat-card"><strong>${totalAttractions}</strong><br/><small>Attractions</small></div>
                <div class="stat-card"><strong>${formatCurrency(totalCost)}</strong><br/><small>Total Cost</small></div>
                <div class="stat-card"><strong>${totalDistance.toFixed(1)} km</strong><br/><small>Distance</small></div>
                <div class="stat-card"><strong>${Math.round(totalTravelTime)} min</strong><br/><small>Travel Time</small></div>
            </div>

            <div class="itinerary-content">
                ${daysHtml}
            </div>
        `;

        pdfContainer.appendChild(innerWrapper);

        // Generate PDF
        const doc = new jsPDF('p', 'mm', 'a4');
        await doc.html(pdfContainer, {
            callback: function (doc) {
                doc.save(`${trip.trip_name || 'Itinerary'}_itinerary.pdf`);
            },
            margin: [10, 10, 10, 10],
            autoPaging: 'text',
            width: 190,
            windowWidth: 1000
        });

    } catch (error) {
        console.error('Export Error:', error);
        alert('PDF Export failed.');
    } finally {
        setExportingPDF(false);
    }
};

    const formatDistance = (dist) => {
        if (dist === undefined || dist === null) return '-';
        return `${dist.toFixed(2)} km`;
    };

    const formatScore = (score) => score?.toFixed(2) ?? '0.00';

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A]/20 to-[#2563EB]/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl text-center">
                        <svg className="animate-spin h-12 w-12 text-[#1E3A8A] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-600 font-medium">Crafting your perfect itinerary...</p>
                        <p className="text-xs text-gray-400 mt-2">Optimizing routes and schedules</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !itineraryData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center border border-gray-100">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
                    <p className="text-gray-500 mb-6">{error || 'No itinerary data available'}</p>
                    <button
                        onClick={() => navigate(`/trip/${tripCode}`)}
                        className="px-6 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold"
                    >
                        Back to Trip
                    </button>
                </div>
            </div>
        );
    }

    const { trip, summary } = itineraryData;
    const days = Object.keys(workingByDay).sort((a, b) => Number(a) - Number(b));
    const currentDayAttractions = workingByDay[selectedDay] || [];

    console.log(`Day ${selectedDay} attractions:`, currentDayAttractions);

    const startLat = parseFloat(trip.start_lat);
    const startLng = parseFloat(trip.start_lng);
    const endLat = parseFloat(trip.end_lat);
    const endLng = parseFloat(trip.end_lng);

    const hasValidStart = !isNaN(startLat) && !isNaN(startLng);
    const hasValidEnd = !isNaN(endLat) && !isNaN(endLng);

    // Group attractions by coordinates (rounded to 6 decimals)
    const coordGroups = new Map();

    currentDayAttractions.forEach((att, idx) => {
        const lat = parseFloat(att.latitude);
        const lng = parseFloat(att.longitude);
        if (isNaN(lat) || isNaN(lng)) return;

        const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
        if (!coordGroups.has(key)) {
            coordGroups.set(key, { lat, lng, attractions: [] });
        }
        coordGroups.get(key).attractions.push({ ...att, originalIndex: idx });
    });

    // Build markers: one per coordinate group
    const groupedMarkers = Array.from(coordGroups.values()).map(group => ({
        lat: group.lat,
        lng: group.lng,
        attractions: group.attractions,
    }));

    // For polyline: use original sequence (keep all original points, even duplicates)
    const polylinePositions = currentDayAttractions
        .filter(att => {
            const lat = parseFloat(att.latitude);
            const lng = parseFloat(att.longitude);
            return !isNaN(lat) && !isNaN(lng);
        })
        .map(att => [parseFloat(att.latitude), parseFloat(att.longitude)]);

    // -------- Build full polyline including start and end points --------
    let fullPolylinePositions = [];

    // Add start point if valid
    if (hasValidStart) {
        fullPolylinePositions.push([startLat, startLng]);
    }

    // Add all attraction points
    fullPolylinePositions.push(...polylinePositions);

    // Add end point if valid and not already the same as the last attraction
    if (hasValidEnd) {
        const lastAttraction = polylinePositions.length > 0
            ? polylinePositions[polylinePositions.length - 1]
            : null;
        const isEndSameAsLast = lastAttraction &&
            Math.abs(lastAttraction[0] - endLat) < 0.000001 &&
            Math.abs(lastAttraction[1] - endLng) < 0.000001;
        if (!isEndSameAsLast) {
            fullPolylinePositions.push([endLat, endLng]);
        }
    }

    // Remove consecutive duplicate points
    const uniquePolyline = [];
    for (let i = 0; i < fullPolylinePositions.length; i++) {
        if (i === 0) {
            uniquePolyline.push(fullPolylinePositions[i]);
        } else {
            const prev = fullPolylinePositions[i - 1];
            const curr = fullPolylinePositions[i];
            if (prev[0] !== curr[0] || prev[1] !== curr[1]) {
                uniquePolyline.push(curr);
            }
        }
    }
    // --------------------------------------------------------------

    const mapCenter = groupedMarkers.length > 0
        ? [groupedMarkers[0].lat, groupedMarkers[0].lng]
        : hasValidStart
        ? [startLat, startLng]
        : [21.1702, 94.8679];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header with decorative elements */}
                <div className="relative mb-12 text-center">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#1E3A8A]/5 rounded-full blur-3xl -z-10"></div>
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4 shadow-sm border border-gray-100">
                        <span className="w-2 h-2 rounded-full bg-[#1E3A8A] animate-pulse"></span>
                        <span className="text-xs font-medium text-gray-600">AI-Powered Journey</span>
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent mb-3">
                        Your Personalized Itinerary
                    </h1>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Optimized daily schedule based on your preferences and travel style
                    </p>
                </div>

                {/* Trip Summary Card - Enhanced */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 mb-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] rounded-2xl blur-md opacity-50"></div>
                                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center shadow-lg">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{trip.trip_name}</h2>
                                <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded-md text-xs">{trip.trip_code}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                    <span>{new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="bg-green-50 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                <span className="text-xs font-medium text-green-700">{days.length} Days</span>
                            </div>
                            <div className="bg-blue-50 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                <span className="text-xs font-medium text-blue-700">{summary.totalAttractions} Attractions</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Stats - Enhanced Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-10">
                    <StatCard 
                        label="Attractions" 
                        value={summary.totalAttractions} 
                        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />}
                        gradient="from-[#1E3A8A] to-[#2563EB]"
                    />
                    <StatCard 
                        label="Total Cost" 
                        value={`${summary.totalCost} Ks`} 
                        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                        gradient="from-[#10B981] to-[#059669]"
                    />
                    <StatCard 
                        label="Total Distance" 
                        value={summary.totalDistance} 
                        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />}
                        gradient="from-[#F59E0B] to-[#D97706]"
                    />
                    <StatCard 
                        label="Travel Time" 
                        value={summary.totalTravelTime} 
                        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />}
                        gradient="from-[#06B6D4] to-[#0891B2]"
                    />
                    <StatCard 
                        label="Visit Time" 
                        value={summary.totalVisitTime} 
                        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                        gradient="from-[#8B5CF6] to-[#6D28D9]"
                    />
                </div>

                {/* Day Tabs + Actions */}
                <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap gap-2 p-1 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-100">
                        {days.map(day => (
                            <DayTab 
                                key={day} 
                                day={day} 
                                isActive={selectedDay === day} 
                                onClick={() => setSelectedDay(day)} 
                            />
                        ))}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        {/* Save button removed from here */}
                    </div>
                </div>

                {previewErrors.length > 0 && (
                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <div className="font-semibold mb-2">Preview validation issues</div>
                        <ul className="list-disc list-inside space-y-1">
                            {previewErrors.map((err, index) => (
                                <li key={index}>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {(freeTimeGaps.length > 0 || suggestions.length > 0) && (
                    <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-slate-800">
                        {freeTimeGaps.map((gap, idx) => {
                            const gapSuggestions = suggestions.find(s => s.gapIndex === idx);
                            return (
                                <div key={idx} className="mb-3">
                                    <div className="font-semibold">Free time: Day {gap.day} {gap.start} – {gap.end} ({gap.minutes} min)</div>
                                    {gapSuggestions && gapSuggestions.options.length > 0 && (
                                        <button
                                            onClick={() => handleFillGap(gap, gapSuggestions.options, idx)}
                                            className="mt-1 px-3 py-1 rounded-full bg-blue-600 text-white text-xs"
                                        >
                                            Fill this slot
                                        </button>
                                    )}

                                    {showFillForGap?.gapIndex === idx && (
                                        <div className="mt-2 p-2 bg-white rounded-lg border">
                                            <div className="font-medium mb-1">Choose an attraction:</div>
                                            {showFillForGap.options.map((opt, i) => (
                                                <div key={i} className="flex justify-between items-center py-1 border-b last:border-0">
                                                    <span>{opt.name} ({opt.duration} min, {opt.cost} Ks)</span>
                                                    <button
                                                        onClick={() => handleSelectSuggestion(gap, opt)}
                                                        className="px-2 py-1 bg-green-600 text-white text-xs rounded"
                                                    >
                                                        Insert
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Map + List Grid - Enhanced */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Map Section */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-[500px] flex flex-col group">
                        <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-5 py-3.5 flex items-center justify-between">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                                Day {selectedDay} Route Map
                            </h3>
                            <div className="text-[10px] text-white/70 bg-white/10 px-2 py-1 rounded-full">
                                {groupedMarkers.length} locations
                            </div>
                        </div>
                        <div className="flex-1 relative bg-gray-50">
                            {groupedMarkers.length > 0 || hasValidStart || hasValidEnd ? (
                                <MapContainer
                                    center={mapCenter}
                                    zoom={13}
                                    style={{ height: '100%', width: '100%' }}
                                    className="z-0"
                                >
                                    <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                    />

                                    {/* Start location marker */}
                                    {hasValidStart && (
                                        <Marker position={[startLat, startLng]} icon={createStartIcon()}>
                                            <Popup>
                                                <div className="font-medium text-sm text-emerald-700">🚩 Trip Start</div>
                                                <div className="text-xs text-gray-500">{trip.trip_name} begins here</div>
                                            </Popup>
                                        </Marker>
                                    )}

                                    {/* End location marker */}
                                    {hasValidEnd && (
                                        <Marker position={[endLat, endLng]} icon={createEndIcon()}>
                                            <Popup>
                                                <div className="font-medium text-sm text-red-700">🏁 Trip End</div>
                                                <div className="text-xs text-gray-500">Final destination</div>
                                            </Popup>
                                        </Marker>
                                    )}

                                    {/* Attraction markers (grouped) */}
                                    {groupedMarkers.map((marker, idx) => (
                                        <Marker
                                            key={idx}
                                            position={[marker.lat, marker.lng]}
                                            icon={createNumberedIcon(
                                                marker.attractions.length > 1
                                                    ? `${marker.attractions.length}x`
                                                    : marker.attractions[0].originalIndex + 1
                                            )}
                                        >
                                            <Popup>
                                                <GroupedPopup attractions={marker.attractions} />
                                            </Popup>
                                        </Marker>
                                    ))}

                                    {/* Polyline for the complete route */}
                                    {routeGeometry.length > 1 && (
                                        <Polyline
                                            positions={routeGeometry}
                                            color="#F59E0B"
                                            weight={4}
                                            opacity={0.8}
                                            dashArray="8, 8"
                                        />
                                    )}
                                </MapContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                    <p className="text-sm">No coordinates available for this day.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* List Section (Cards) - Enhanced */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-[500px] flex flex-col">
                        <div className="bg-gradient-to-r from-[#06B6D4] to-[#1E3A8A] px-5 py-3.5 flex items-center justify-between">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                Day {selectedDay} Itinerary
                            </h3>
                            <div className="text-[10px] text-white/70 bg-white/10 px-2 py-1 rounded-full">
                                {currentDayAttractions.length} stops
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scroll">
                            <div className="space-y-3">
                                {currentDayAttractions.map((att, idx) => {
                                    const duration = getDuration(att.visit_start_time, att.visit_end_time);
                                    return (
                                        <div 
                                            key={idx} 
                                            className="group relative bg-white rounded-xl p-4 border border-gray-100 hover:border-[#1E3A8A]/20 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
                                        >
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#1E3A8A] to-[#2563EB] rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A] text-xs font-bold">
                                                        {idx + 1}
                                                    </span>
                                                    <h4 className="font-bold text-gray-800 group-hover:text-[#1E3A8A] transition-colors">
                                                        {att.attraction_name}
                                                    </h4>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
                                                    att.final_score >= 1 ? 'bg-green-100 text-green-700' :
                                                        att.final_score >= 0.7 ? 'bg-blue-100 text-blue-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    Score: {formatScore(att.final_score)}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <svg className="w-4 h-4 text-[#1E3A8A]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-xs">{att.visit_start_time} – {att.visit_end_time}</span>
                                                    <span className="text-xs text-gray-400">({duration} min)</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <svg className="w-4 h-4 text-[#1E3A8A]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                                    </svg>
                                                    <span className="text-xs">{formatDistance(att.distance_from_previous)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <svg className="w-4 h-4 text-[#1E3A8A]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                    <span className="text-xs">Travel: {att.travel_minutes} min</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {att.is_best_time && (
                                                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Best Time
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-4 space-y-3">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <button
                                                        onClick={() => handleRecalculateMove(getItemCode(att), Number(selectedDay), idx - 1)}
                                                        disabled={recalcLoadingItem !== null || idx === 0 || lockedItems.includes(getItemCode(att))}
                                                        className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 bg-white text-gray-700 border-gray-200 hover:border-[#1E3A8A]/30"
                                                    >
                                                        ▲ Up
                                                    </button>
                                                    <button
                                                        onClick={() => handleRecalculateMove(getItemCode(att), Number(selectedDay), idx + 1)}
                                                        disabled={recalcLoadingItem !== null || idx === currentDayAttractions.length - 1 || lockedItems.includes(getItemCode(att))}
                                                        className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 bg-white text-gray-700 border-gray-200 hover:border-[#1E3A8A]/30"
                                                    >
                                                        ▼ Down
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenChangeDay(getItemCode(att))}
                                                        disabled={recalcLoadingItem !== null || lockedItems.includes(getItemCode(att))}
                                                        className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 bg-white text-gray-700 border-gray-200 hover:border-[#1E3A8A]/30"
                                                    >
                                                        ⟳ Change day
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenEditTime(getItemCode(att), att.visit_start_time, att.duration_minutes)}
                                                        disabled={recalcLoadingItem !== null || lockedItems.includes(getItemCode(att))}
                                                        className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 bg-white text-gray-700 border-gray-200 hover:border-[#1E3A8A]/30"
                                                    >
                                                        ✏️ Edit time
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleLock(getItemCode(att))}
                                                        disabled={recalcLoadingItem !== null}
                                                        className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 bg-white text-gray-700 border-gray-200 hover:border-[#1E3A8A]/30"
                                                    >
                                                        {lockedItems.includes(getItemCode(att)) ? '🔓 Unlock' : '🔒 Lock'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleRecalculateDelete(getItemCode(att))}
                                                        disabled={recalcLoadingItem !== null || lockedItems.includes(getItemCode(att))}
                                                        className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 bg-white text-red-600 border-red-200 hover:bg-red-50"
                                                    >
                                                        🗑 Delete
                                                    </button>
                                                    {lockedItems.includes(getItemCode(att)) && (
                                                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                                                            🔒 Locked
                                                        </span>
                                                    )}
                                                </div>
                                                {changeDayFor === getItemCode(att) && (
                                                    <div className="rounded-2xl border border-gray-200 bg-slate-50 p-3">
                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                            <label className="space-y-2 text-xs text-gray-600">
                                                                <span className="font-semibold">Target Day</span>
                                                                <select
                                                                    value={changeDayValues.newDay}
                                                                    onChange={(e) => handleChangeDayInput('newDay', e.target.value)}
                                                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                                                                >
                                                                    {days.map((day) => (
                                                                        <option key={day} value={day}>Day {day}</option>
                                                                    ))}
                                                                </select>
                                                            </label>
                                                            <label className="space-y-2 text-xs text-gray-600">
                                                                <span className="font-semibold">Position</span>
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    max={(workingByDay[changeDayValues.newDay] || []).length}
                                                                    value={changeDayValues.newPosition}
                                                                    onChange={(e) => handleChangeDayInput('newPosition', e.target.value)}
                                                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                                                                />
                                                            </label>
                                                            <div className="flex items-end gap-2">
                                                                <button
                                                                    onClick={() => handleApplyChangeDay(getItemCode(att))}
                                                                    disabled={recalcLoadingItem !== null}
                                                                    className="w-full rounded-xl bg-[#1E3A8A] px-3 py-2 text-xs font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#164e63]"
                                                                >
                                                                    Apply
                                                                </button>
                                                                <button
                                                                    onClick={handleCancelChangeDay}
                                                                    type="button"
                                                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:border-[#9CA3AF]"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {recalcError && (
                                                            <p className="mt-3 text-xs text-red-600">{recalcError}</p>
                                                        )}
                                                    </div>
                                                )}
                                                {editTimeFor === getItemCode(att) && (
                                                    <div className="rounded-2xl border border-gray-200 bg-slate-50 p-3 mt-3">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            <label className="space-y-2 text-xs text-gray-600">
                                                                <span className="font-semibold">New start time</span>
                                                                <input
                                                                    type="time"
                                                                    value={editStartValue}
                                                                    onChange={(e) => setEditStartValue(e.target.value)}
                                                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                                                                />
                                                            </label>
                                                            <label className="space-y-2 text-xs text-gray-600">
                                                                <span className="font-semibold">Duration (minutes)</span>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={editDurationValue}
                                                                    onChange={(e) => setEditDurationValue(e.target.value)}
                                                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                                                                />
                                                            </label>
                                                        </div>
                                                        <div className="flex items-end gap-2 mt-3">
                                                            <button
                                                                onClick={() => handleApplyEditTime(getItemCode(att))}
                                                                disabled={recalcLoadingItem !== null}
                                                                className="rounded-xl bg-[#1E3A8A] px-3 py-2 text-xs font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#164e63]"
                                                            >
                                                                Apply
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEditTime}
                                                                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:border-[#9CA3AF]"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                        {recalcError && <p className="mt-3 text-xs text-red-600">{recalcError}</p>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Buttons at bottom – Save Itinerary + Export PDF + Back to Trip Details */}
                <div className="mt-10 flex justify-end gap-4">
                    {mode === 'generate' && (
                        <button
                            onClick={handleSaveItinerary}
                            disabled={saving || !isPreviewValid}
                            title={!isPreviewValid ? 'Resolve preview validation issues before saving' : ''}
                            className="relative group px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-[#10B981] to-[#059669] text-white hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {saving ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                        </svg>
                                        Save Itinerary
                                    </>
                                )}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                    )}

                    {/* Export PDF Button - visible in both generate and view modes */}
                    <button
                        onClick={handleExportPDF}
                        disabled={exportingPDF}
                        className="relative group px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {exportingPDF ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Export PDF
                                </>
                            )}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>

                    {cameFromTripDetail ? (
                        <button
                            onClick={() => navigate(`/tripDetail/${tripCode}`)}
                            className="group relative px-6 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 flex items-center gap-2 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <svg className="w-5 h-5 relative z-10 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="relative z-10">Back to Trip Details</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/tripLists')}
                            className="group relative px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 flex items-center gap-2 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <svg className="w-5 h-5 relative z-10 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="relative z-10">Back to My Itineraries</span>
                        </button>
                    )}
                </div>

                {/* Success/Error messages – placed below buttons for clarity */}
                <div className="mt-4 flex justify-end">
                    {saveSuccess && (
                        <span className="text-sm font-medium text-green-700 bg-green-100/80 backdrop-blur-sm px-3 py-2 rounded-xl flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {saveSuccess}
                        </span>
                    )}
                    {saveError && (
                        <span className="text-sm font-medium text-red-700 bg-red-100/80 backdrop-blur-sm px-3 py-2 rounded-xl flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {saveError}
                        </span>
                    )}
                </div>
            </div>

            {/* Add custom scrollbar styles */}
            <style jsx>{`
                .custom-scroll::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scroll::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 4px;
                }
                .custom-scroll::-webkit-scrollbar-thumb {
                    background: #1E3A8A;
                    border-radius: 4px;
                }
                .custom-scroll::-webkit-scrollbar-thumb:hover {
                    background: #2563EB;
                }
            `}</style>
        </div>
    );
};