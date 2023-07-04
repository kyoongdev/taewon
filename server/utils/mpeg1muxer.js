var Mpeg1Muxer, child_process, events, util

child_process = require('child_process')

util = require('util')

events = require('events')

Mpeg1Muxer = function(options) {
  var key
  this.url = options.url
  this.ffmpegOptions = options.ffmpegOptions
  this.exitCode = undefined
  this.recordOptions = []
  this.additionalFlags = []
  if (this.ffmpegOptions) {
    for (key in this.ffmpegOptions) {
      if(key === 'record'){
        this.recordOptions = [
          '-s',
          '640x360',
          '-acodec',
          'copy',
          '-vcodec',
          'copy',
        ]
        this.recordOptions.push(String(this.ffmpegOptions[key]))
      }else{
        this.additionalFlags.push(key)
        if (String(this.ffmpegOptions[key]) !== '') {
          this.additionalFlags.push(String(this.ffmpegOptions[key]))
        }
      }
    }
  }
  // this.spawnOptions = [
  //   "-i",
  //   this.url,
  //   '-f',
  //   'mpegts',
  //   '-codec:v',
  //   'mpeg1video',
  //   // additional ffmpeg options go here
  //   ...this.additionalFlags,
  //   '-'
  // ]
  this.spawnOptions = [
    // "-i",
    // this.url,
    // '-f',
    // 'mpegts',
    // '-codec:v',
    // 'mpeg1video',
    // // additional ffmpeg options go here
    // ...this.additionalFlags,
    // '-'
    "-rtsp_transport", "tcp", "-i",
    this.url,
    //...this.recordOptions,
    '-f',
    'mpeg1video',
    '-b:v', '1000k',
    '-maxrate', '1000k',
    '-bufsize', '1000k',
     '-an', '-r', '30',
    // additional ffmpeg options go here
    ...this.additionalFlags,
    '-'
  ]
  this.stream = child_process.spawn(options.ffmpegPath, this.spawnOptions, {
    detached: false
  })
  this.inputStreamStarted = true
  this.stream.stdout.on('data', (data) => {
    return this.emit('mpeg1data', data)
  })
  this.stream.stderr.on('data', (data) => {
    return this.emit('ffmpegStderr', data)
  })
  this.stream.on('exit', (code, signal) => {
    if (code === 1) {
      console.error('RTSP stream exited with error')
      this.exitCode = 1
      return this.emit('exitWithError')
    }
  })
  return this
}

util.inherits(Mpeg1Muxer, events.EventEmitter)

module.exports = Mpeg1Muxer
