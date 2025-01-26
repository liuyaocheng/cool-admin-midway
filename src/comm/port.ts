import { execSync } from 'child_process';

/**
 * 同步检查端口是否可用（通过系统命令）
 * @param {number} port - 要检查的端口
 * @returns {boolean} - 是否可用
 */
function isPortAvailableSync(port: number): boolean {
  try {
    if (process.platform === 'win32') {
      // Windows 使用 netstat 检查端口
      execSync(`netstat -ano | findstr :${port}`, { stdio: 'ignore' });
    } else {
      // Linux/Mac 使用 lsof 检查端口
      execSync(`lsof -i :${port}`, { stdio: 'ignore' });
    }
    // 命令执行成功，端口被占用
    return false;
  } catch (error) {
    // 命令执行失败，端口可用
    return true;
  }
}

/**
 * 查找可用端口（同步）
 * @param {number} startPort - 起始端口
 * @returns {number} - 可用的端口
 */
export function checkPort(startPort: number): number {
  let port = startPort;
  while (port <= 65535) {
    if (isPortAvailableSync(port)) {
      if (port !== startPort) {
        console.warn(
          '\x1b[33m%s\x1b[0m',
          `Port ${startPort} is occupied, using port ${port}`
        );
      }
      return port;
    }
    port++;
  }
  throw new Error('No available port found');
}
