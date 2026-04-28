// Temporary test to invoke generateItinerary with mocked repos
const itineraryService = require('./src/services/itinerary.service');

// Mock repositories by monkey-patching required modules used inside the service
const tripRepo = require('./src/repositories/trip.repository');
const attractionRepo = require('./src/repositories/attraction.repository');
const experienceRepo = require('./src/repositories/attractionExperience.repository');
const systemConfigRepo = require('./src/repositories/systemConfig.repository');

// Provide simple mocks
tripRepo.findByCode = async (code) => ({
  trip_id: 1,
  trip_code: code,
  start_date: '2026-04-01T00:00:00Z',
  end_date: '2026-04-01T00:00:00Z',
  start_lat: 21.17,
  start_lng: 94.85,
  end_lat: 21.18,
  end_lng: 94.88,
  budget: 100
});
tripRepo.getTripPreferences = async () => ([]);
tripRepo.getTripSchedule = async () => ({ day_start_time: '08:00', day_end_time: '18:00' });

attractionRepo.findAll = async () => ([
  // include one attraction so routing schedules it
  { attraction_id: 1, attraction_name: 'A', latitude: 21.175, longitude: 94.86, duration_minutes: 60, cost: 0, category_id: 1, open_time: '08:00', close_time: '17:00' }
]);

experienceRepo.getAllExperiences = async () => ([]);

systemConfigRepo.getSystemConfig = async () => ({ travel_speed_kmh: 50 });

(async () => {
  try {
    const res = await itineraryService.generateItinerary('TRIP-POINT-TO-POINT-001');
    console.log('Return leg (last item):', res.itinerary[res.itinerary.length -1]);
  } catch (e) {
    console.error('Error running test:', e);
  }
})();
