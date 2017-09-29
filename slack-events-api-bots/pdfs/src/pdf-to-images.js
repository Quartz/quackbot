const gm = require('gm');
const fs = require('fs');


// fs.readFile('./spitzer.complaint.pdf', function (error, filedata) {
//     if (error) throw error;
//   
  
    gm('./quackbot-icon.png').identify("%p ", function (err, data) {
        
        if (err) throw err;
        
        console.log(data);
    });
  
//  
// });

