import React from "react";
import { connect } from "react-redux";
import { useParams } from 'react-router-dom';
import BaseballWorkspace from "../../components/workspace/baseballworkspace";
import "./pose-visualization-annotation.scss";
import { AlertComponent } from "../../components/alert-component/alert-component";
import { PoseVisualizationRighMenuWrapper } from "../pose-visualization-page/pose-visualization-annotation/pose-visualization-right-menu/pose-visualization-right-menu-wrapper";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Dropdown } from 'react-bootstrap';

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sportType: 0,
      selectedLabel: "demo",  // Default label
      fps: 150,
    };

    this.selectOption = this.selectOption.bind(this);
  }

  componentDidMount() {
    // 从路由参数中获取 exp 和 num
    const { exp, num } = this.props.params;

    // 根据获取到的参数做一些操作，例如更新状态或加载数据
    console.log("Experiment:", exp);
    console.log("Number:", num);

    // 可以在这里调用 selectOption 或其他方法来更新状态
    this.selectOption(exp, num);
  }

  selectOption(sportType, label) {
    this.setState({
      sportType: sportType,
      selectedLabel: label,
    });
  }

  render() {
    const { exp, num } = this.props.params;

    return (
      <React.Fragment>
        <h5 className="text-center">Baseball BVH Visualize Page</h5>
       
        <BaseballWorkspace 
          sportType={this.state.selectedLabel} 
          fps={this.state.fps} 
          exp={exp} 
          num={num} 
        />
      </React.Fragment>
    );
  }
}

// 高阶组件来获取 URL 参数
const withRouterParams = (Component) => (props) => {
  const params = useParams();
  return <Component {...props} params={params} />;
};

// 使用高阶组件 withRouterParams 将路由参数传递给类组件
const Redux = connect((store) => ({
  alertReducer: store.AlertReducer,
  currentAnalysis: store.TrainingAnalysisReducer.currentAnalysis,
  actionRecording: store.ActionRecordingReducer,
  style: store.StyleReducer,
}))(withRouterParams(Component));

export const baseballbvhPage = Redux;
