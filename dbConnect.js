require('dotenv').config()
const { Pool, Client } = require('pg')
const Telnet = require('telnet-client')

var cli = new Client({
  connectionString: process.env.DATABASE_URL
});

cli.connect();

module.exports = {
  getAllRouters: async function (req, res) {
    //const team_ids = req.body.postData.team_ids;
    //var itemsPerPage = req.body.postData.itemsPerPage;
    //var page = req.body.postData.page;

    cli.query(`select * from routerProperties`, (err, op) => {
      if (err) {
        res.send({
          err: err
        });
      }
      else if (op && op.rows) {
        res.send({
          data: op.rows
        });
      } else {
        res.send({
          data: []
        });
      }
    });
  },

  insertRouter: function (req, res) {
    const macaddr = req.body.postData.mac;
    var cidr = req.body.postData.cidr;
    var hostname = req.body.postData.hostname;
    var sapid = req.body.postData.sapid;
    
    console.log(`insert into routerProperties(macaddr,hostname,cidr,sapid) values('${macaddr}','${hostname}','${cidr}','${sapid}')`);

    cli.query(`insert into routerProperties(macaddr,hostname,cidr,sapid) values('${macaddr}','${hostname}','${cidr}','${sapid}') RETURNING macaddr`, (err, op) => {
      if (err) {
        console.log(JSON.stringify(err));
        res.send({
          err: err.name
        });
      }
      else if (op && op.rowCount) {
        res.send({
          data: op.rows[0].macaddr
        });
      } else {
        res.send({
          err: "Some error Occured"
        });
      }
    });
  },

  deleteRouter: function (req, res) {
      
    console.log(JSON.stringify(req.body.postData));
    const macaddr = req.body.postData.mac;

    cli.query(`delete from routerProperties where macaddr='${macaddr}'`, (err, op) => {
      if (err) {
        console.log(JSON.stringify(err));
        res.send({
          err: err.name
        });
      }
      else if (op && op.rowCount) {
        res.send({
          data: op.rowCount
        });
      } else {
        res.send({
          err: "Some error Occured"
        });
      }
    });
  },

  telnetServer: async function (req, result) {
  
      let connection = new Telnet()
     
      // these parameters are just examples and most probably won't work for your use-case.
      let params = {
        host: '127.0.0.1',
        port: 23,
        shellPrompt: '/ # ', // or negotiationMandatory: false
        timeout: 1500
      }
     
      try {
        await connection.connect(params)
      } catch(error) {
        // handle the throw (timeout)
      }
     
      let res = await connection.exec('uptime');
      console.log('async result:', res);
  },


  sshServer: async function (req, res){
    var Client = require('ssh2').Client;
 
    var conn = new Client();
    conn.on('ready', function() {
      console.log('Client :: ready');
      conn.shell(function(err, stream) {
        if (err) throw err;
        stream.on('close', function() {
          console.log('Stream :: close');
          conn.end();
        }).on('data', function(data) {
          console.log('OUTPUT: ' + data);
        });
        stream.end('ls -l\nexit\n');
      });
    }).connect({
      host: '192.168.100.100',
      port: 22,
      username: 'frylock',
      privateKey: require('fs').readFileSync('./key')
    });
  },

  listFiles(req, res){
   const { exec } = require('child_process');
   exec('ls | grep js', (err, stdout, stderr) => {
   if (err) {
    //some err occurred
     console.error(err)
   } else {
   // the *entire* stdout and stderr (buffered)
   console.log(`stdout: ${stdout}`);
   console.log(`stderr: ${stderr}`);
   }
   });
  },

  diskUsage(req, res){
    const { exec } = require('child_process');
    exec('df', (err, stdout, stderr) => {
    if (err) {
     //some err occurred
      console.error(err)
    } else {
    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    }
    });
  },

  copyFiles(req, res){
    const { exec } = require('child_process');
    const username1 = req.query.username1;
    const username2 = req.query.username2;
    const source = req.query.source;
    const destination = req.query.destination;
    const source_path = req.query.source_path;
    const destination_path = req.query.destination_path;

    exec(`scp -r ${username1}@${source}:${source_path} ${username2}@${destination}:${destination_path}`, (err, stdout, stderr) => {
    if (err) {
     //some err occurred
      console.error(err)
    } else {
    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    }
    });
  },
  
  inodeUsage(req, res){
    const { exec } = require('child_process');
    exec('df -i', (err, stdout, stderr) => {
    if (err) {
     //some err occurred
      console.error(err)
    } else {
    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    }
    });
  },

  generate: async function (req, res) {
    //const team_ids = req.body.postData.team_ids;
    //var itemsPerPage = req.body.postData.itemsPerPage;
    var count = req.query.count;
    console.log(count);
    res.send({
      data: this.generateNAddresses(count)
    });
  },

  generateNAddresses: function (count) {
    var all= [];
    console.log("count: "+ parseInt(count));
    for (var c=0; c< parseInt(count); c++){
    console.log("count: "+ parseInt(i));

    var hexDigits = "0123456789ABCDEF";
    var macAddress = "";
    for (var i = 0; i < 6; i++) {
      macAddress+=hexDigits.charAt(Math.round(Math.random() * 15));
      macAddress+=hexDigits.charAt(Math.round(Math.random() * 15));
      if (i != 5) macAddress += ":";
    }
    console.log("macAddress:"+macAddress);
    all.push(macAddress);
    }
    console.log(JSON.stringify(all));
    return all;   
  }
}