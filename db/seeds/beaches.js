
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('beaches').del()
    .then(function () {
      return Promise.all([
        // Inserts seed entries
        knex('beaches').insert({id: 1, name: 'French Beach', latitude: 48.393225, longitude: -123.946579}),
        knex('beaches').insert({id: 2, name: 'Jordan River', latitude: 48.420599, longitude: -124.055697}),
        knex('beaches').insert({id: 3, name: 'China Beach', latitude: 48.434017, longitude: -124.094669}),
        knex('beaches').insert({id: 4, name: 'Bear Beach', latitude: 48.452520, longitude: -124.18218}),
        knex('beaches').insert({id: 5, name: 'Sombrio Beach', latitude: 48.499151, longitude: -124.301541}),
        knex('beaches').insert({id: 6, name: 'Port Renfrew', latitude: 48.530889, longitude: -124.466240}),
        knex('beaches').insert({id: 7, name: 'Florencia Boy', latitude: 48.993466, longitude: -125.632130}),
        knex('beaches').insert({id: 8, name: 'Long Beach', latitude:  49.060110, longitude: -125.749646}),
        knex('beaches').insert({id: 9, name: 'Cox Bay', latitude: 49.101182, longitude: -125.888953}),
        knex('beaches').insert({id: 10, name: 'Chesterman Beach', latitude: 49.120379, longitude: -125.903195})
      ]);
    });
};