<template>
  <div class="map-page">
    <!-- 顶部搜索栏 -->
    <div class="search-header">
      <van-search
        v-model="searchKeyword"
        placeholder="搜索活动、地点..."
        shape="round"
        readonly
        @click="onSearchClick"
      />
    </div>

    <!-- 直接在地图容器中显示内容，不使用外部组件 -->
    <div class="map-container">
      <div class="map-content">
        <h2>🗺️ 校园活动地图</h2>
        <p>基于位置的校园活动与组队平台</p>
        <div class="activity-list">
          <div class="activity-item">
            <span class="icon">🏀</span>
            <div class="info">
              <h3>篮球友谊赛</h3>
              <p>体育馆 · 15人参加</p>
            </div>
          </div>
          <div class="activity-item">
            <span class="icon">📚</span>
            <div class="info">
              <h3>读书分享会</h3>
              <p>图书馆 · 8人参加</p>
            </div>
          </div>
          <div class="activity-item">
            <span class="icon">💻</span>
            <div class="info">
              <h3>编程学习小组</h3>
              <p>计算机楼 · 12人参加</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建活动按钮 -->
    <div class="create-button">
      <van-button 
        type="primary" 
        round 
        icon="plus" 
        @click="onCreateActivity"
        size="large"
      >
        创建活动
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchKeyword = ref('')

const onCreateActivity = () => {
  router.push('/create-activity')
}

const onSearchClick = () => {
  router.push('/activities')
}
</script>

<style scoped>
.map-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.search-header {
  background: #fff;
  flex-shrink: 0;
}

.map-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.map-content {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.map-content h2 {
  color: #1976d2;
  margin-bottom: 10px;
  text-align: center;
}

.map-content p {
  color: #1976d2;
  margin-bottom: 30px;
  text-align: center;
}

.activity-list {
  width: 100%;
  max-width: 400px;
}

.activity-item {
  background: white;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.activity-item .icon {
  font-size: 24px;
  margin-right: 15px;
}

.activity-item .info h3 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 16px;
}

.activity-item .info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.create-button {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}
</style>