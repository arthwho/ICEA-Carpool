// Mock Firestore service for development
// Replace with real Firebase Firestore later

let mockDb = {
  users: {},
  rides: {
    'ride_1': { 
      id: 'ride_1', 
      driverName: 'Ana', 
      origin: 'Centro', 
      departureTime: '08:00', 
      availableSeats: 3, 
      status: 'available', 
      createdAt: new Date(Date.now() - 100000).toISOString() 
    },
    'ride_2': { 
      id: 'ride_2', 
      driverName: 'Bruno', 
      origin: 'Bairro de Fátima', 
      departureTime: '07:45', 
      availableSeats: 1, 
      status: 'available', 
      createdAt: new Date(Date.now() - 200000).toISOString() 
    },
  },
  rideOrder: ['ride_1', 'ride_2'],
};

const mockFirestore = {
  collection: (collectionName) => ({
    doc: (docId) => ({
      set: async (data) => {
        console.log(`Firestore SET: ${collectionName}/${docId}`, data);
        if (collectionName === 'users') {
          mockDb.users[docId] = data;
        }
      },
      update: async (data) => {
        console.log(`Firestore UPDATE: ${collectionName}/${docId}`, data);
        if (collectionName === 'rides' && mockDb.rides[docId]) {
          mockDb.rides[docId] = { ...mockDb.rides[docId], ...data };
        }
      },
      delete: async () => {
        console.log(`Firestore DELETE: ${collectionName}/${docId}`);
        if (collectionName === 'rides') {
          delete mockDb.rides[docId];
          mockDb.rideOrder = mockDb.rideOrder.filter(id => id !== docId);
        }
      },
      get: async () => {
        console.log(`Firestore GET: ${collectionName}/${docId}`);
        return {
          exists: !!mockDb.users[docId],
          data: () => mockDb.users[docId],
        };
      },
    }),
    add: async (data) => {
      const id = `ride_${Date.now()}`;
      console.log(`Firestore ADD: ${collectionName}/${id}`, data);
      mockDb.rides[id] = { ...data, id };
      mockDb.rideOrder.unshift(id);
      return { id };
    },
    where: (field, op, value) => ({
      onSnapshot: (callback) => {
        console.log(`Firestore SNAPSHOT on ${collectionName}`);
        const ridesArray = mockDb.rideOrder
          .map(id => mockDb.rides[id])
          .filter(ride => ride && ride.status === 'available');
        
        callback({
          docs: ridesArray.map(doc => ({
            id: doc.id,
            data: () => doc,
          }))
        });
        return () => {}; // Unsubscribe
      }
    })
  }),
};

export { mockFirestore, mockDb };
