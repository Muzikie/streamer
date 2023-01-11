const path = require('path');
const fs = require('fs');
const { AUDIOS } = require('../../../config/api');
const { WS_MESSAGES } = require('../../constants');
const ERRORS = require('../../errors');
const ws = require('../../ws');

// eslint-disable-next-line max-statements, consistent-return
exports.streamAudio = (req, res) => {
  const { range, address } = req.headers;

  ws.request(WS_MESSAGES.SUBSCRIPTION.HAS, { address })
    // eslint-disable-next-line max-statements
    .then((response) => {
      if (!response.success) {
        return res.status(401).send(ERRORS.NO_SUBSCRIPTION);
      }
      // get audio stats (about 3MB)
      const audioID = req.params.id;
      // @todo Implement audio file path
      const filePath = `${path.join(__dirname, '../../../', AUDIOS.PATH) + audioID  }.${AUDIOS.EXTENSION}`;
      let audioSize = 0;
      try {
        const file = fs.statSync(filePath);
        audioSize = file.size;
      } catch (e) {
        return res
          .status(404)
          .send(ERRORS.FILE_NOT_FOUND);
      }


      // Parse Range
      // Example: "bytes=32324-"
      // @todo Handle error if range is not valid, or when headers are not set correctly
      const CHUNK_SIZE = 10 ** 5; // 100KB
      const start = Number(range.replace(/\D/g, ''));
      const end = Math.min(start + CHUNK_SIZE, audioSize - 1);

      // Create headers
      const contentLength = end - start + 1;
      const headers = {
        'Content-Range': `bytes ${start}-${end}/${audioSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': contentLength,
        'Content-Type': 'audio/mpeg'
      }

      // HTTP Status 206 for Partial Content
      res.writeHead(206, headers);

      // create video read stream for this particular chunk
      const audioStream = fs.createReadStream(filePath, { start, end });

      // Stream the video chunk to the client
      return audioStream.pipe(res);
    })
    .catch(() => {
      return res.status(400).send(ERRORS.UNHANDLED_ERROR);
    });
};

