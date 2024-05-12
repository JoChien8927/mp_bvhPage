import React, { Component } from "react";

import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import "./style.scss";

import { Range } from "rc-slider";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

import { Button, Menu, Dropdown } from "antd";
import { ReactSVG } from "react-svg";

const styles = () => ({});

export default withStyles(styles, { withTheme: false })(
  class Playback extends Component {
    render() {
      const props = this.props;
      const playbackIsPlay = this.props.playbackIsPlay;

      const speedOptions = (
        <Menu>
          <Menu.Item
            onClick={() => {
              props.updateSpeed(2);
            }}
            key="2"
          >
            <div>2x</div>
          </Menu.Item>
          <Menu.Item
            onClick={() => {
              props.updateSpeed(1);
            }}
            key="1"
          >
            <div>1x</div>
          </Menu.Item>
          <Menu.Item
            onClick={() => {
              props.updateSpeed(0.5);
            }}
            key="0.5"
          >
            <div>0.5x</div>
          </Menu.Item>
          <Menu.Item
            onClick={() => {
              props.updateSpeed(0.25);
            }}
            key="0.25"
          >
            <div>0.25x</div>
          </Menu.Item>
        </Menu>
      );

      return (
        <Grid container className="ControlsWrapper">
          <Grid container>
            <div className={"PlaybackWrapper"}>
              <Range
                className={"ErrorIndicator"}
                min={0}
                max={props.playbackMaxValue}
                defaultValue={props.playbackCurFrame}
                value={props.playbackBadValue}
                trackStyle={props.playbackBadColor}
                disabled
              />
              <Slider
                className={"PlaybackBar"}
                allowCross={false}
                min={0}
                max={props.playbackMaxValue}
                defaultValue={props.playbackCurFrame[1]}
                value={props.playbackCurFrame[1]}
                onChange={props.updateFramPosFromSlider}
                step={0.01}
              />
            </div>
          </Grid>
          <Grid
            container
            item
            xs={12}
            justifyContent="center"
            alignItems="center"
          >
            <Grid
              item
              xs={1}
              className={"CenterContent"}
              onClick={() => {
                props.updateLoopMode();
              }}
            >
              <ReactSVG
                className={
                  "play-back-icon" + (props.playbackIsLoop ? " active" : "")
                }
                src="/img/icon_on_repeat.svg"
              />
            </Grid>
            <Grid
              item
              xs={1}
              className={"CenterContent"}
              onClick={() => {
                props.playBackInterval(-100, false);
              }}
            >
              <ReactSVG
                className="play-back-icon"
                src="/img/icon_previous.svg"
              />
            </Grid>
            <Grid
              item
              xs={1}
              className={"CenterContent"}
              onClick={() => {
                props.playPauseScene(!playbackIsPlay);
              }}
            >
              {playbackIsPlay ? (
                <ReactSVG
                  className="play-back-icon"
                  src="/img/icon_pause.svg"
                />
              ) : (
                <ReactSVG className="play-back-icon" src="/img/icon_play.svg" />
              )}
            </Grid>
            <Grid
              item
              xs={1}
              className={"CenterContent"}
              onClick={() => {
                props.playBackInterval(100, false);
              }}
            >
              <ReactSVG className="play-back-icon" src="/img/icon_next.svg" />
            </Grid>
            <Grid item xs={1} className={"CenterContent"}>
              <Dropdown
                className={"SpeedDropDown"}
                overlay={speedOptions}
                placement="topRight"
                trigger={["click"]}
              >
                <Button>{props.playbackSpeed}x</Button>
              </Dropdown>
            </Grid>
          </Grid>
        </Grid>
      );
    }
  },
);
