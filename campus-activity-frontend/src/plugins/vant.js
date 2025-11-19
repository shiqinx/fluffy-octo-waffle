// 最简版本，只包含核心组件
import { 
  Button,
  NavBar,
  Tabbar,
  TabbarItem,
  Icon,
  Cell,
  CellGroup,
  Image,
  Loading,
  Field,
  Form,
  Search,
  Picker,
  DatePicker,
  Switch,
  Tabs,
  Tab,
  Card,
  Tag,
  Toast,
  Dialog,
  Popup,
  Grid,
  GridItem,
  ActionSheet,
  RadioGroup,
  Radio,
  Checkbox,
  Badge,
  Empty,
  PullRefresh,
  List,
  DropdownMenu,
  DropdownItem,
  Notify  // 添加 Notify
} from 'vant'

const components = [
  Button,
  NavBar,
  Tabbar,
  TabbarItem,
  Icon,
  Cell,
  CellGroup,
  Image,
  Loading,
  Field,
  Form,
  Search,
  Picker,
  DatePicker,
  Switch,
  Tabs,
  Tab,
  Card,
  Tag,
  Toast,
  Dialog,
  Popup,
  Grid,
  GridItem,
  ActionSheet,
  RadioGroup,
  Radio,
  Checkbox,
  Badge,
  Empty,
  PullRefresh,
  List,
  DropdownMenu,
  DropdownItem
]

export default {
  install(app) {
    components.forEach(component => {
      app.use(component)
    })
    
    // 挂载全局方法
    app.config.globalProperties.$toast = Toast
    app.config.globalProperties.$dialog = Dialog
    app.config.globalProperties.$notify = Notify
  }
}