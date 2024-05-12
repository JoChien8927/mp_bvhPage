export const Actions = {
  menu: {
    general: { open_collapse: "menu.general.open_collapse" },
    mode: {
      changed: "menu.mode.changed",
    },
    draw: {
      activate_inactivate: "menu.draw.activate_inactivate",
      pencil_selected: "menu.draw.pencil_selected",
      eraser_selected: "menu.draw.eraser_selected",
      color: "menu.draw.color",
      undo: "menu.draw.undo",
      redo: "menu.draw.redo",
      clear: "menu.draw.clear",
      brush_size: "menu.draw.brush_size",
    },
    angles: {
      activate_inactivate: "menu.angles.activate_inactivate",
      show_hide_angle: "menu.angles.show_hide_angle",
    },
    trajectory: {
      activate_inactivate: "menu.trajectory.activate_inactivate",
      show_hide_limb: "menu.trajectory.show_hide_limb",
      density: "menu.trajectory.density",
      length: "menu.trajectory.length",
    },
  },
  player: {
    play_pause: "player.play_pause",
    play_interval: "player.play_interval",
    update_frame: "player.update_frame",
    speed: "player.speed",
    loop: "player.loop",
  },
  threeJS: {
    camera: { position_changed: "threeJS.camera.position_changed" },
    thumbnail: "threeJS.thumbnail",
    drawing: {
      stroke: "threeJS.drawing.stroke",
      erase: "threeJS.drawing.erase",
    },
  },
  voiceNote: {
    start: "voiceNote.start",
  },
  comments: {
    new: "comments.new",
  },
  // click_activate_inactivate: "click_activate_inactivate",
  // change_density: "change_density",
  // change_length: "change_length",
  // click_limb: "click_limb",
  // click_activate_inactivate: "click_activate_inactivate",
  // click_angle: "click_angle",
  // click_activate_inactivate: "click_activate_inactivate",
  // click_show_hide: "click_show_hide",
  // new_comment: "new_comment",
  // start: "start",
  // rotation: "rotation",
  // zoom: "zoom",
  // translate: "translate",
};
