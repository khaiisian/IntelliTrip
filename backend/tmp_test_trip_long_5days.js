// Temporary test to invoke generateItinerary for a 5-day trip with multiple attractions
const itineraryService = require('./src/services/itinerary.service');
const tripRepo = require('./src/repositories/trip.repository');
const attractionRepo = require('./src/repositories/attraction.repository');
const experienceRepo = require('./src/repositories/attractionExperience.repository');
const systemConfigRepo = require('./src/repositories/systemConfig.repository');

tripRepo.findByCode = async (code) => ({
  trip_id: 2,
  trip_code: code,
  start_date: '2026-04-01T00:00:00Z',
  end_date: '2026-04-05T00:00:00Z',
  start_lat: 21.17,
  start_lng: 94.85,
  end_lat: 21.17,
  end_lng: 94.85,
  budget: 1000
});
tripRepo.getTripPreferences = async () => ([]);
tripRepo.getTripSchedule = async () => ({ day_start_time: '08:00', day_end_time: '18:00' });

// Several attractions spread around so routing has options
attractionRepo.findAll = async () => ([
  { attraction_id: 10, attraction_name: 'A1', latitude: 21.175, longitude: 94.86, duration_minutes: 60, cost: 10, category_id: 1, open_time: '08:00', close_time: '17:00' },
  { attraction_id: 11, attraction_name: 'A2', latitude: 21.18, longitude: 94.87, duration_minutes: 90, cost: 20, category_id: 1, open_time: '09:00', close_time: '17:00' },
  { attraction_id: 12, attraction_name: 'A3', latitude: 21.19, longitude: 94.88, duration_minutes: 120, cost: 30, category_id: 2, open_time: '10:00', close_time: '16:00' },
  { attraction_id: 13, attraction_name: 'A4', latitude: 21.16, longitude: 94.84, duration_minutes: 45, cost: 5, category_id: 2, open_time: '08:00', close_time: '18:00' },
  { attraction_id: 14, attraction_name: 'A5', latitude: 21.15, longitude: 94.83, duration_minutes: 30, cost: 0, category_id: 3, open_time: '07:00', close_time: '19:00' }
]);

experienceRepo.getAllExperiences = async () => ([]);
systemConfigRepo.getSystemConfig = async () => ({ travel_speed_kmh: 40 });

(async () => {
  try {
    const res = await itineraryService.generateItinerary('TRIP-LONG-5DAYS-001');
    console.log('Itinerary generated. Total stops:', res.itinerary.length);
  } catch (e) {
    console.error('Error running 5-day test:', e);
  }
})();
