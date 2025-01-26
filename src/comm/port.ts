const net = require('net');
const deasync = require('deasync');

/**
 * 同步检查端口是否可用
 * @param {number} port - 要检查的端口
 * @returns {boolean} - 是否可用
 */
function isPortAvailableSync(port) {
  let available = false;
  let checked = false; // 新增标志变量，表示检查是否完成
  const server = net.createServer();

  server.once('error', err => {
    if (err.code === 'EADDRINUSE') {
      checked = true; // 标记检查完成
      server.close();
    }
  });

  server.once('listening', () => {
    available = true; // 标记端口可用
    checked = true; // 标记检查完成
    server.close();
  });

  server.listen(port);

  // 阻塞直到检查完成（checked === true）
  deasync.loopWhile(() => !checked);
  return available;
}

/**
 * 查找可用端口（同步）
 * @param {number} startPort - 起始端口
 * @returns {number} - 可用的端口
 */
export function checkPort(startPort: number) {
  let port = startPort;
  while (port <= 65535) {
    if (isPortAvailableSync(port)) {
      console.log(`Valid port: ${port}`);
      return port;
    }
    port++;
  }
  throw new Error('No available port found');
}
