// 检查和清理localStorage中的活动数据
console.log('=== 检查localStorage中的活动数据 ===');

// 检查所有localStorage键
const keys = Object.keys(localStorage);
console.log('localStorage中的所有键:', keys);

// 检查活动相关的键
const activityKeys = keys.filter(key => key.includes('activity') || key.includes('Activity'));
console.log('活动相关的键:', activityKeys);

// 检查每个活动相关的数据
activityKeys.forEach(key => {
  try {
    const data = localStorage.getItem(key);
    console.log(`\n=== ${key} ===`);
    console.log('原始数据:', data);
    
    if (data) {
      const parsed = JSON.parse(data);
      console.log('解析后的数据:', parsed);
      
      // 检查是否是数组
      if (Array.isArray(parsed)) {
        console.log('数据类型: 数组，长度:', parsed.length);
        parsed.forEach((item, index) => {
          console.log(`[${index}] 标题:`, item.title || item.name || '无标题');
        });
      } else if (typeof parsed === 'object') {
        console.log('数据类型: 对象');
        if (parsed.activities && Array.isArray(parsed.activities)) {
          console.log('包含activities数组，长度:', parsed.activities.length);
          parsed.activities.forEach((item, index) => {
            console.log(`[${index}] 标题:`, item.title || item.name || '无标题');
          });
        }
      }
    }
  } catch (error) {
    console.error(`解析${key}时出错:`, error);
  }
});

// 清理被污染的数据
console.log('\n=== 清理被污染的数据 ===');
const keysToClean = ['activities', 'campus_activities', 'activity_data'];

keysToClean.forEach(key => {
  if (localStorage.getItem(key)) {
    console.log(`清理键: ${key}`);
    localStorage.removeItem(key);
  }
});

console.log('清理完成！');