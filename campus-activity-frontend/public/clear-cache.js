// 清理localStorage中的活动数据缓存
console.log('🧹 开始清理活动数据缓存...');

// 清理所有相关的localStorage项
const keysToRemove = [
  'campus_activities',
  'activity_store_activities',
  'user_activities',
  'current_activity',
  'activity_detail_cache'
];

keysToRemove.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`✅ 已清理: ${key}`);
  } else {
    console.log(`⚠️ 不存在: ${key}`);
  }
});

// 清理sessionStorage
sessionStorage.clear();

console.log('🎉 缓存清理完成！请刷新页面重新加载数据。');

// 提示用户刷新页面
if (confirm('缓存已清理完成！是否现在刷新页面重新加载数据？')) {
  window.location.reload();
}