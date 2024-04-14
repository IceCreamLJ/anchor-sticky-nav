import React, { Component, useState } from "react";
import "./index.scss";

const prefix = "nav";
const blockId = `${prefix}-block-id`;
const saveInfo = {
  clickFlag: false,
};

const list = [
  {
    label: "选项卡一",
    value: "1",
    key: "1",
    height: 150,
  },
  {
    label: "选项卡二",
    value: "2",
    key: "2",
    height: 400,
  },
  {
    label: "选项卡三",
    value: "3",
    key: "3",
    height: 230,
  },
  {
    label: "选项卡四",
    value: "4",
    key: "4",
    height: 320,
  },
  {
    label: "选项卡五",
    value: "5",
    key: "5",
    height: 200,
  },
  {
    label: "选项卡六",
    value: "6",
    key: "6",
    height: 180,
  },
  {
    label: "选项卡七",
    value: "7",
    key: "7",
    height: 300,
  },
  {
    label: "选项卡八",
    value: "8",
    key: "8",
    height: 400,
  },
];

export default class Index extends Component {
  state = {
    activeKey: "1",
    count: 0,
  };
  domMap = new Map();
  tabsObj = {};

  componentDidMount = () => {
    this.observerDom();
    this.calcTabsLeft();
  };

  calcTabsLeft() {
    this.tabsObj = {};
    const tabs = document.querySelectorAll(`[data-tab-item-id]`);
    tabs.forEach((tab) => {
      const rect = tab.getBoundingClientRect();
      const key = tab.getAttribute("data-tab-item-id");
      this.tabsObj[key] = rect.x;
    });
  }

  componentDidUpdate = (prevProps) => {
    if (!this.observer) {
      this.observerDom();
    }
    // 当 randomNum 发生变化时，移除原来观察的元素，设置新的可观察元素
    if (prevProps.randomNum !== this.props.randomNum) {
      this.observerDisconnect();
      this.domMap.clear();
      this.observerDom();
    }
  };

  observerDom = () => {
    const contentWrap = document.querySelector(".contentWrap");
    const observerNodes = [
      ...contentWrap.querySelectorAll(`[${blockId}^="${prefix}-"]`),
    ];
    const homeHeaderEle = document.querySelector(".homeHeader");
    const homeHeight = homeHeaderEle?.getBoundingClientRect().height;
    const horiScrollWrap = document.querySelector(".horiScrollWrap");
    const horiScrollHeight = horiScrollWrap?.getBoundingClientRect().height;
    const marginTop = homeHeight + horiScrollHeight;
    const options = {
      root: contentWrap, // 监听元素的祖先元素
      rootMargin: `-${marginTop}px 0px 0px 0px`, // 计算交叉值时添加至根的边界盒中的一组偏移量
      threshold: 0, // 规定了一个监听目标与边界盒交叉区域的比例值
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // 更新 isIntersecting 属性，是否相交
        this.setDomMap(entry.target, { isIntersecting: entry.isIntersecting });
      });

      // 遍历所有属性，更新距离顶部高度
      Array.from(this.domMap.keys()).forEach((dom) => {
        const rect = dom.getBoundingClientRect();
        this.setDomMap(dom, { top: rect.top, height: rect.height });
      });

      let min = 1000;
      let key = null;

      for (const [, value] of this.domMap) {
        if (value.isIntersecting) {
          if (value.top < min) {
            min = value.top;
            key = value.key;
          }
        }
      }

      if (key && !saveInfo.clickFlag) {
        this.setActiveKey(key);
      }
      saveInfo.clickFlag = false;
    }, options);

    observerNodes.forEach((el, index) => {
      this.observer.observe(el);
      const attr = el.getAttribute(blockId);
      const key = attr?.split("-")?.[1];
      this.setDomMap(el, {
        isIntersecting: false,
        key,
        index,
        top: -1,
        height: -1,
      });
    });
  };

  componentWillUnmount = () => {
    this.observerDisconnect();
  };

  observerDisconnect = () => {
    this.observer?.disconnect();
  };

  setDomMap = (dom, obj) => {
    const element = this.domMap.get(dom);
    const value = {
      key: element?.key,
      top: element?.top,
      height: element?.height,
      index: element?.index,
      isIntersecting: element?.isIntersecting,
      ...obj,
    };
    this.domMap.set(dom, value);
  };

  getTop = (key) => {
    let scrollTop = 0;
    Array.from(this.domMap.keys()).forEach((dom) => {
      const domValue = this.domMap.get(dom);
      if (domValue.key === key) {
        scrollTop = dom.offsetTop;
      }
    });
    return scrollTop;
  };

  onClickTabItem = (key) => {
    const vertScrollWrap = document.querySelector(".vertScrollWrap");
    // 导航栏高度 + 距离父元素高度
    const tabs = document.querySelector(".horiScrollWrap");
    const tabsHeight = tabs.getBoundingClientRect().height;
    const top = this.getTop(key) - tabsHeight;

    const observerItem = vertScrollWrap.querySelector(
      `[${blockId}="${prefix}-${key}"]`
    );
    if (observerItem) {
      // 将 clickFlag 定义为 true 时，不会在 intersectionObserver 处因为滑动导致不相交时而更新选项卡高亮的值
      saveInfo.clickFlag = true;
      const options = {
        left: 0,
        top,
      };
      vertScrollWrap.scroll(options);
    }

    this.setState({
      activeKey: key,
    });
  };

  setActiveKey = (key) => {
    if (!this.canElementScrollDown()) return;
    this.setState(
      {
        activeKey: key,
      },
      () => {
        this.navScroll();
      }
    );
  };

  canElementScrollDown = () => {
    const vertScrollWrap = document.querySelector(".vertScrollWrap");
    return (
      vertScrollWrap.scrollTop <
      vertScrollWrap.scrollHeight - vertScrollWrap.clientHeight
    );
  };

  isInViewport = (element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  };

  // 导航栏横向滑动
  navScroll() {
    const { activeKey } = this.state;
    const scrollTab = document.querySelector('[data-tab="tab"]');
    const horiScrollItem = scrollTab?.querySelector(
      `[data-tab-item-id=${prefix}-${activeKey}]`
    );

    if (horiScrollItem && !this.isInViewport(horiScrollItem)) {
      const navDataId = `${prefix}-${activeKey}`;
      const elementX = this.tabsObj[navDataId] - 12;
      scrollTab.scrollTo(elementX, 0);
    }
  }

  render() {
    const { activeKey } = this.state;
    return (
      <>
        <div className="horiScrollWrap">
          <div className="scrollTab" data-tab="tab">
            {list.map((item) => (
              <div
                data-tab-item-id={`${prefix}-${item.key}`}
                key={item.key}
                className={`tabItem ${
                  activeKey === item.value ? "selected" : ""
                }`}
                onClick={() => {
                  this.onClickTabItem(item.value);
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
        <div className="observerWrap">
          {list.map((item) => {
            const blockProps = {
              [blockId]: `${prefix}-${item.key}`,
              key: item.key,
            };
            return (
              <div className="observerItem" {...blockProps}>
                <div className="conetentItem" style={{ height: item.height }}>
                  <h2>内容区域：{item.label}</h2>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  }
}
