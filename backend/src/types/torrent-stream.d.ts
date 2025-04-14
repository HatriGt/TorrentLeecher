declare module 'torrent-stream' {
  interface TorrentEngine {
    destroy(): void;
    magnetURI: string;
    infoHash: string;
    torrent: {
      name: string;
      length: number;
    };
    files: Array<{
      name: string;
      length: number;
      path: string;
      select(): void;
    }>;
    swarm: {
      downloaded: number;
      downloadSpeed(): number;
      uploaded: number;
      wires: Array<{
        address: string;
        port: number;
      }>;
    };
  }

  function TorrentStream(magnetLink: string, options?: any): TorrentEngine;
  export default TorrentStream;
} 