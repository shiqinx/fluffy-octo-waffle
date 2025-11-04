import { 
  Button, 
  Form, 
  Field, 
  CellGroup, 
  NavBar,
  Tabbar, 
  TabbarItem,
  Toast,
  Dialog
} from 'vant'

const components = [
  Button,
  Form,
  Field,
  CellGroup,
  NavBar,
  Tabbar,
  TabbarItem,
  Toast,
  Dialog
]

export default {
  install(app) {
    components.forEach(component => {
      app.use(component)
    })
  }
}