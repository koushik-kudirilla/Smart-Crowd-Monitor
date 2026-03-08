/**
 * Structured data for each tourist spot.
 * Add or edit spots here to extend the platform.
 */
const SPOTS_DATA = {
  beach: {
    id: "beach",
    name: "The Park",
    type: "Park",
    description: "The Park is a serene urban green space offering lush lawns, walking paths, and shaded seating areas. Ideal for morning walks, picnics, and family outings. The well-maintained gardens and peaceful atmosphere make it a favorite among locals and visitors alike.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Bay%20Park%2C%20Vizag.jpg?width=1400",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Amphi%20theater%20gallery%20at%20VUDA%20Park.JPG?width=1400",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Balance%20of%20nature%20statue%20at%20VUDA%20Park%20Visakhapatnam.JPG?width=1400",
    ],
    bestVisitingTime: "6:00 AM – 9:00 AM",
    location: "MVP Colony, Visakhapatnam, Andhra Pradesh",
    coordinates: [17.7312, 83.3015],
    isProductNode: true,
    offsetFactor: 1.0,
  },
  park: {
    id: "park",
    name: "Tenneti Park",
    type: "Park",
    description: "Tenneti Park is a scenic waterfront park perched on the hills overlooking the Bay of Bengal. Famous for its panoramic sea views, landscaped gardens, and the iconic Kailasagiri ropeway. A perfect spot for sunset views and leisurely strolls along the coastline.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Beach%20Road%20View%20at%20Tenneti%20Park1.jpg?width=1400",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Sunrise%20at%20Tenneti%20park%20beach%20Visakhapatnam.jpg?width=1400",
      "https://commons.wikimedia.org/wiki/Special:FilePath/MAA%20Ship%20in%20Vizag%20Tenneti%20Park.jpg?width=1400",
    ],
    bestVisitingTime: "5:00 PM – 7:30 PM (sunset)",
    location: "Jodugullapalem, Visakhapatnam, Andhra Pradesh",
    coordinates: [17.7245, 83.3189],
    isProductNode: false,
    offsetFactor: 0.6,
  },
  temple: {
    id: "temple",
    name: "Kailasgiri",
    type: "Hill Park",
    description: "Kailasgiri is a hilltop park and viewpoint offering breathtaking 360° views of Visakhapatnam city and the coastline. Home to the 40-foot Shiva-Parvati statue, ropeway rides, and well-maintained gardens. A must-visit for panoramic photography and family recreation.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Shiva%2C%20Parvati%20statues%20on%20Kailasagiri%2006.jpg?width=1400",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Ropeway%20on%20Kailsagiri%20hill.jpg?width=1400",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Visakhapatnam%20city%20from%20Kailasagiri.jpg?width=1400",
    ],
    bestVisitingTime: "6:00 AM – 10:00 AM or 4:00 PM – 7:00 PM",
    location: "Kailasagiri, Visakhapatnam, Andhra Pradesh",
    coordinates: [17.7589, 83.3521],
    isProductNode: false,
    offsetFactor: 0.8,
  },
  museum: {
    id: "museum",
    name: "Rushikonda Beach",
    type: "Beach",
    description: "Rushikonda Beach is one of Visakhapatnam's most popular beaches, known for its golden sands, clear waters, and water sports. The beach offers swimming, surfing, and scenic walks. Lined with coconut palms, it's ideal for both adventure seekers and those seeking relaxation.",
    images: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Rushikonda%20Lord%20Venkateswara%20Temple%20view.jpg?width=1400",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Rushikonda%20Beach%20at%20night.jpg?width=1400",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Footprints%20of%20an%20Eagle%20on%20Beach%20Sand%20at%20Rushikonda.JPG?width=1400",
    ],
    bestVisitingTime: "5:30 AM – 9:00 AM or 4:00 PM – 6:30 PM",
    location: "Rushikonda, Visakhapatnam, Andhra Pradesh",
    coordinates: [17.7732, 83.3756],
    isProductNode: false,
    offsetFactor: 0.5,
  },
};
