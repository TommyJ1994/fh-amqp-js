var url = require('url');

function setSchema(node_url, amqpConnectionCfg) {
  var schema = node_url.protocol.substring(0, node_url.protocol.lastIndexOf(':'));
  if (schema !== 'amqp' && schema !== 'amqps') {
    throw new Error('Connection URI must use amqp or amqps');
  }
  amqpConnectionCfg.ssl = amqpConnectionCfg.ssl || {};
  amqpConnectionCfg.ssl.enabled = ('amqps' === schema);
}

function setPort(node_url, amqpConnectionCfg) {
  if (node_url.port) {
    amqpConnectionCfg.port = node_url.port;
  }
}

function setAuth(node_url, amqpConnectionCfg) {
  if (node_url.auth) {
    var auth = node_url.auth.split(':');
    if (auth[0]) {
      amqpConnectionCfg.login = auth[0];
    }
    if (auth[1]) {
      amqpConnectionCfg.password = auth[1];
    }
  }
}

function setVHost(node_url, amqpConnectionCfg) {
  if (node_url.pathname) {
    amqpConnectionCfg.vhost = unescape(node_url.pathname.substr(1));
  }
}

function addMoreHosts(node_url, amqpConnectionCfg) {
  if (node_url.hostname) {
    var hosts = amqpConnectionCfg.host;
    if (typeof hosts === 'string') {
      hosts = [hosts];
    }
    hosts.push(node_url.hostname);
    amqpConnectionCfg.host = hosts;
  }
}

function parseClusterNodes(clusterNodes) {
  var amqpConnectionCfg = {
    ssl:{}
  };
  for (var i=0;i<clusterNodes.length;i++) {
    var node = clusterNodes[i];
    var node_url = url.parse(node);
    if (i === 0) {
      amqpConnectionCfg.host = node_url.hostname;
      setSchema(node_url, amqpConnectionCfg);
      setPort(node_url, amqpConnectionCfg);
      setAuth(node_url, amqpConnectionCfg);
      setVHost(node_url, amqpConnectionCfg);
    } else {
      addMoreHosts(node_url, amqpConnectionCfg);
    }

  }
  return amqpConnectionCfg;
}

module.exports = parseClusterNodes;