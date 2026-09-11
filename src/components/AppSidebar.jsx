import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarHeader,
} from '@coreui/react'

import { AppSidebarNav } from './AppSidebarNav'
import Logo from 'src/assets/brand/logo'
import navigation from '../_nav'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom d-flex align-items-center justify-content-between px-3">
        <CSidebarBrand to="/" className="d-flex align-items-center text-decoration-none">
          <Logo
            className="sidebar-brand-full"
            height={40}
            width={170}
            style={{ maxWidth: '100%', height: 'auto', objectFit: 'contain' }}
          />
          <Logo
            className="sidebar-brand-narrow"
            height={32}
            width={32}
            style={{ objectFit: 'contain' }}
          />
        </CSidebarBrand>

        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>

      <AppSidebarNav items={navigation} />
    </CSidebar>
  )
}

export default React.memo(AppSidebar)