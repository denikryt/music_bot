const { userSchema, trackSchema } = require('./models.js');
const mongoose = require('mongoose');

// const uri = ''

// const client = new MongoClient(uri);

// const db = client.db('test');
// const Users = db.collection('users');
// const SoundTracks = db.collection('soundtracks');

const Users = mongoose.model('users', userSchema);

async function check_and_create(data){
    let user = await Users.findOne({user_id: data.user_id})

        if(!user){
            const doc = {
                user_id: data.user_id,
                user_name: data.user_name,
                last_message_id: data.message_id
            }
            const user = new Users(doc)
            await user.save();
            return false
            
        }else{
            console.log(data.user_id, 'ЮЗЕР УЖЕ ЕСТЬ!')
            return true 
        }
        return
}

async function update_last_message(data){
    await Users.findOneAndUpdate(
        { user_id: data.user_id }, 
        { $inc: { last_message_id: 1 } },
        { new: true }
        );
        return
}

async function update_last_message_by_channel_id(data){
    await Users.findOneAndUpdate(
        { channel_id: data.channel_id }, 
        { $inc: { last_message_id: 1 } },
        { new: true }
        );
        return
}

async function new_track(data){
    const user = await get_user_by_channel_id(data.channel_id)
    let collectionName = `${user.user_name}(${user.user_id})`;
    const soundTracks = mongoose.model(collectionName, trackSchema);
    const exists = await soundTracks.findOne({ url: data.url });

    if (!exists){
        const newTrack = new soundTracks({
            url: data.url,
            thumbnail: data.thumbnail,
            title: data.title,
            message_id: user.last_message_id
        })
        await newTrack.save() 

    } else {
        sendMessage(user_id, 'УЖЕ ЕСТЬ!')
    }
    return
}

async function set_channel_id(data){
    await Users.findOneAndUpdate(
        { user_id: data.user_id }, 
        { $set: { channel_id: -1001830200744 } },
        { upsert: false, new: true })
      return
}

async function create_collection(data){
    const collection_name = `${data.user_name}(${data.user_id})`;
        try {
            if(!mongoose.connection.collections[collection_name]){
                let Tracks = mongoose.model(collection_name, trackSchema);
            }
        } catch (error) {
            console.log(`An error occurred while creating the collection: ${error}`);
        }
        return
}

async function get_user_by_channel_id(channel_id){
    const user = await Users.findOne({ channel_id: channel_id });
    return user
}

const functions = {
    check_and_create,
    update_last_message,
    update_last_message_by_channel_id,
    get_user_by_channel_id,
    new_track,
    set_channel_id,
    create_collection
}
module.exports = functions;
