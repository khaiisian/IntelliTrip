// Temporary test to save a generated itinerary
const itineraryService = require('./src/services/itinerary.service');

async function testSaveItinerary() {
    try {
        console.log('Testing itinerary save functionality...');

        // First generate an itinerary
        const generated = await itineraryService.generateItinerary('TRIP-LONG-5DAYS-001');

        if (!generated.success) {
            console.error('Failed to generate itinerary');
            return;
        }

        console.log('Generated itinerary with', generated.itinerary.length, 'items');

        // Now save it
        const saved = await itineraryService.saveItinerary('TRIP-LONG-5DAYS-001', generated);

        if (saved.success) {
            console.log('✅ Itinerary saved successfully!');
            console.log('Itinerary code:', saved.itinerary.itinerary_code);
            console.log('Items saved:', saved.itinerary.tbl_itinerary_item.length);
        } else {
            console.error('❌ Failed to save itinerary');
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testSaveItinerary();