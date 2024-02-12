const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const steamGameSchema = new Schema({
    appid: Number,
    name: String,
    developer: String,
    description: String,
    publisher: String,
    score_rank: String,
    positive: Number,
    negative: Number,
    userscore: Number,
    owners: String,
    average_forever: Number,
    average_2eeks: Number,
    median_forever: Number,
    median_2weeks: Number,
    price: String,
    initialprice: Number,
    discount: Number,
    ccu: Number,
    languages: String,
    genre: String,
    tags: Schema.Types.Mixed,
    steam: [Schema.Types.Mixed],
    last_updated: Date,
    invalid: Boolean,
  });
  

module.exports = model('games', steamGameSchema);