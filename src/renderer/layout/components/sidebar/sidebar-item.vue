<template>
  <div
    v-if="!item.meta || !item.meta.hidden"
    :class="{ 'simple-mode': isCollapse, 'first-level': isFirstLevel }"
  >
    <template
      v-if="!alwaysShowRootMenu && theOnlyOneChild && !theOnlyOneChild.children"
    >
      <SidebarItemLink
        v-if="theOnlyOneChild.meta"
        :to="resolvePath(theOnlyOneChild.path)"
      >
        <el-menu-item :index="resolvePath(theOnlyOneChild.path)">
          <el-tooltip
            effect="dark"
            v-if="isCollapse"
            :content="theOnlyOneChild.meta.title"
            placement="right"
          >
            <div class="collapse-image-box">
              <el-image
                v-if="theOnlyOneChild.meta.icon"
                fit="cover"
                :src="theOnlyOneChild.meta.icon"
              ></el-image>
            </div>
          </el-tooltip>
          <el-image
            v-else-if="theOnlyOneChild.meta.icon"
            fit="cover"
            :src="theOnlyOneChild.meta.icon"
          ></el-image>
          <template v-if="theOnlyOneChild.meta.title&&!isCollapse" #title>
            <text class="hidden-xs-only">
              {{ theOnlyOneChild.meta.title }}
            </text>
          </template>
        </el-menu-item>
      </SidebarItemLink>
    </template>
  </div>
</template>

<script lang="ts" setup>
import path from "path";
import { RouteRecordRaw } from "vue-router";
import { computed, defineProps, PropType } from "vue";
import { isExternal } from "../../../utils/validate";
import SidebarItemLink from "./sidebar-item-link.vue";
const props = defineProps({
  item: {
    type: Object as PropType<RouteRecordRaw>,
    required: true,
  },
  isCollapse: {
    type: Boolean,
    required: false,
  },
  isFirstLevel: {
    type: Boolean,
    default: true,
  },
  basePath: {
    type: String,
    required: true,
  },
});

const alwaysShowRootMenu = computed(() => {
  return !!(props.item.meta && props.item.meta.alwaysShow);
});

const showingChildNumber = computed(() => {
  if (props.item.children) {
    const showingChildren = props.item.children.filter((item) => {
      return !(item.meta && item.meta.hidden);
    });
    return showingChildren.length;
  }
  return 0;
});

const theOnlyOneChild = computed(() => {
  if (showingChildNumber.value > 1) {
    return null;
  }
  if (props.item.children) {
    for (const child of props.item.children) {
      if (!child.meta || !child.meta.hidden) {
        return child;
      }
    }
  }
  // If there is no children, return itself with path removed,
  // because this.basePath already contains item's path information
  return { ...props.item, path: "" };
});
const resolvePath = (routePath: string) => {
  if (isExternal(routePath)) {
    return routePath;
  }
  if (isExternal(props.basePath)) {
    return props.basePath;
  }
  return path.resolve(props.basePath, routePath);
};
</script>

<style lang="scss" scoped>
.simple-mode {
  &.first-level {
    ::v-deep(.el-sub-menu) {
      .el-sub-menu__icon-arrow {
        display: none;
      }
      span {
        visibility: hidden;
      }
    }
  }
}
/deep/ .el-image {
  width: 17px;
  margin-right: 20px;
}
/deep/ .el-menu-item {
  height: 65px;
  line-height: 65px;
  display: flex !important;
  align-items: center;
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  &.is-active {
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background-color: #39cedd;
    }
  }
  display: block;
  * {
    display: flex;
    align-items: center;
  }
}
.collapse-image-box {
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
}
@media (max-width: 1200px) {
  /deep/ .el-image {
    margin-right: 0px;
  }
  .el-menu-item {
    justify-content: center;
  }
}
</style>