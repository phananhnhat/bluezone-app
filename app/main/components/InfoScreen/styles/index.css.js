/*
 * @Project Bluezone
 * @Author Bluezone Global (contact@bluezone.ai)
 * @Createdate 04/26/2020, 16:36
 *
 * This file is part of Bluezone (https://bluezone.ai)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

import {StyleSheet} from 'react-native';
import * as fontSize from '../../../../core/fontSize';
import {blue_bluezone} from '../../../../core/color';
import {heightPercentageToDP, widthPercentageToDP} from '../../../../core/utils/dimension';

const HEADER_BẠCKGROUND_LOGO = heightPercentageToDP((171 / 720) * 100);
const LOGO_HEIGHT = heightPercentageToDP((70 / 720) * 100);
const BODY_PADDING_HORIZONTAL = widthPercentageToDP((20 / 360) * 100);
const DATE_PADDINGBOTTOM = heightPercentageToDP((25 / 720) * 100);
const BTN_HEIGHT = heightPercentageToDP((46 / 720) * 100);
const TITLE_PADDING_VERTICAL = heightPercentageToDP((25 / 720) * 100);
const BTN_MARGIN_HORIZONTAL = heightPercentageToDP((23 / 720) * 100);
const ICON_SIZE = heightPercentageToDP((15 / 720) * 100);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: blue_bluezone,
  },

  containerLogo: {
    height: HEADER_BẠCKGROUND_LOGO,
    backgroundColor: blue_bluezone,
    paddingHorizontal: 69.2,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },

  body: {
    flex: 1,
    paddingHorizontal: BODY_PADDING_HORIZONTAL,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: fontSize.larger,
    color: '#000000',
    paddingVertical: TITLE_PADDING_VERTICAL,
  },

  viewDep: {
    // flex: 1,
    justifyContent: 'center',
    // alignItems: 'center',
  },

  description: {
    fontSize: fontSize.normal,
    lineHeight: 25,
  },

  borderLogo: {
    borderWidth: 0.4,
    borderColor: '#ffffff',
    height: LOGO_HEIGHT,
  },

  date: {
    lineHeight: 28,
    fontSize: fontSize.normal,
  },

  textContact: {
    fontSize: fontSize.normal,
    lineHeight: 25,
  },

  textTitle: {
    color: '#000',
    marginBottom: 10,
    fontSize: fontSize.huge,
    paddingHorizontal: 20,
  },

  textBottom: {
    paddingBottom: DATE_PADDINGBOTTOM,
  },

  textBtnReload: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    color: '#0166de',
    fontSize: fontSize.larger,
  },

  linkweb: {
    color: '#0166de',
    fontSize: fontSize.normal,
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  buttonSend: {
    height: BTN_HEIGHT,
    backgroundColor: '#119a01',
    marginHorizontal: BTN_MARGIN_HORIZONTAL,
  },
  buttonIcon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    marginRight: 7,
  },
  note: {
    fontSize: fontSize.fontSize14,
    color: '#AAAAAA',
    textAlign: 'center',
    marginHorizontal: BTN_MARGIN_HORIZONTAL,
    marginBottom: 28,
    paddingTop: 14,
  },
});

export {LOGO_HEIGHT};

export default styles;
