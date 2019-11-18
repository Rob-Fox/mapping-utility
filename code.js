const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const fs = require('fs');
const shortid = require('shortid');
let pic_location;

function check_DB(){
    var adapter;
    //SET YOUR MAIN DATABASE LOCATION HERE
    if(fs.existsSync("")){
        console.log('Main DB')
        //MAIN DB LOCATION AGAIN
        adapter = new FileSync('');
        //LOCATION FOR PICTURES TO BE STORED, IDEALLY IN A FOLDER AT SAME LEVEL AS MAIN DB
        pic_location = ""
    }
    else{
        console.log("Backup DB")
        //SET BACKUP DB LOCATION HERE IF YOUR MAIN DB IS ON A NETWORK
        adapter = new FileSync('C:\\map_util\\db.json');
        //LOCATION FOR PICTURES TO BE STORED
        pic_location = "C:\\map_util\\Site_Photos\\"
    }
    return adapter;
}
const adapter = check_DB();
const db = low(adapter);
db.defaults({'locations': {}}).write();

console.log('connected to DB');

function lat_long(data){
    data = data.split(', ');
    if(data[0][0] == '-'){
        return [data[1], data[0]]
    }
    else{
        return [data[0], data[1]]
    }
}

function pic_process(data, name){
    if(data !== "N/A"){
        if(data !== ""){
            var arr = [];
            try{
                fs.mkdirSync(pic_location + name);
                var files = data.split(';');
                for(var i = 0; i < files.length; i++){
                    var new_file = pic_location + name + "\\" + name + i.toString() + "." + files[i].split('.')[files[i].split('.').length-1]
                    fs.copyFileSync(files[i], new_file);
                    arr.push(new_file);
                }
            }
            catch(err){
                if(err.code !== 'EEXIST'){
                    alert(err)
                    console.error(err)
                }
            }
        }
        else{
            arr = 'N/A'
        }
    }
    else{
        arr = 'N/A'
    }
    return arr;
}

function desc_process(data){
    if(data !== ""){
        return data;
    }
    else{
        return 'none'
    }
}

function submit_new(name, location, pic, description){
    var lat = lat_long(location)[0]
    var long = lat_long(location)[1];
    db.set('locations.'+shortid.generate(), {
        Name: name,
        Lat: parseFloat(lat),
        Long: parseFloat(long),
        Pic: pic_process(pic, name),
        Notes: desc_process(description)
    }).write()
}

read = function (){
    return db.get('locations').value()
}

function get_long(key){
    return db.get('locations').get(key).get('Long').value()
}
function get_lat(key){
    return db.get('locations').get(key).get('Lat').value()
}
function set_location(key, location){
    db.get("locations."+key).assign({Lat: parseFloat(location[0]), Long: parseFloat(location[1])}).write()
}
function get_pic(key){
    return db.get('locations').get(key).get('Pic').value()
}
function set_pic(key, pic){
    var name = db.get('locations').get(key).get('Name').value()
    db.get('locations.'+key).assign({Pic: pic_process(pic, name)}).write()
}
function get_name(key){
    return db.get('locations').get(key).get('Name').value()
}
function set_name(key, name){
    db.get('locations.'+key).assign({Name: name}).write()
}
function get_notes(key){
    return db.get('locations').get(key).get('Notes').value()
}
function set_notes(key, notes){
    db.get('locations.'+key).assign({Notes: notes}).write()
}
function height_or_width(h, w){
    if(h > (1.5*w)){
        return ['240px', 'auto']
    }
    else{
        return ['auto', '320px']
    }
}
function delete_item(id){
    db.unset('locations.'+id, db.get('locations.'+id)).write()
    updateMap();
}
function edit_item(id){
    var name = get_name(id);
    var description = get_notes(id);
    var location = [get_lat(id), get_long(id)]
    var pic = get_pic(id);
    $("#"+id).children().remove()
    $("#"+id).append("<td><input style='width: 100%;' type='text' value=\'"+name+"\'></td><td><input style='width: 100%;' type='text' value=\'"+location+"\'></td><td><input style='width: 100%;' type='text' value=\'"+pic+"\'></td><td><textarea style='height: 75%;'>"+description+"</textarea></td>")
    var values = [];
    $("#"+id).children().each(function(){
        values.push($(this).children().val())
    })
    $("#"+id).append("<td><button onclick='get_data(\""+id+"\")'>Submit</button></td>")

}
function get_data(id){
    data = [];
    $("#"+id).children().each(function(){
        data.push($(this).children().val())
    })
    submit_edit(id, data);
}
function submit_edit(id, data){
    if(data[0] != get_name(id)){
        set_name(id, data[0]);
    }
    else{
    }
    if(data[1].split(',')[0] != get_lat(id).toString() || data[1].split(',')[1] != get_long(id).toString()){
        set_location(id, data[1].split(','));
    }
    else{
    }
    if(data[2] != get_pic(id)){
        set_pic(id, data[2])
    }
    else{
    }
    if(data[3] != get_notes(id)){
        set_notes(id, data[3])
    }
    else{
    }
    updateMap();
}