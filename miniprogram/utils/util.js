const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
function sharePage(param) {

  let paramArr = [];
  if (param && typeof param == 'object') {
      for (let key in param) {
          paramArr.push(key + '=' + param[key])
      }
  }
  console.log(getCurrentPages());
  return {
      title: '即构ECommerceLive',
      path: getCurrentPages().pop().route + '?' + paramArr.join('&'),
      imageUrl: '/resource/share.png'
  }
}
module.exports = {
  formatTime: formatTime,
  sharePage: sharePage
}
