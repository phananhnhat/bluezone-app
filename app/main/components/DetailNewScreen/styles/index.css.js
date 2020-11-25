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

import * as fontSize from '../../../../core/fontSize';
import {StyleSheet, Platform} from 'react-native';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from '../../../../core/utils/dimension';
import {isIPhoneX} from '../../../../core/utils/isIPhoneX';

const HEADER_MAX_HEIGHT = heightPercentageToDP((70 / 720) * 100);
const HEADER_IPHONE_X_HEIGHT = heightPercentageToDP((50 / 720) * 100);
const FIGURE_MARGIN_VERTICAL = heightPercentageToDP((21 / 720) * 100);
const CONTENT_ANDROID_PADDING_TOP = heightPercentageToDP((95 / 720) * 100);
const CONTENT_IOS_PADDING_TOP = heightPercentageToDP((30 / 720) * 100);
const MARGIN_HORIZONTAL = widthPercentageToDP((20 / 360) * 100);
const P_MARGIN_BOTTOM = heightPercentageToDP((7 / 720) * 100);
const H1_MARGIN_BOTTOM = heightPercentageToDP((10 / 720) * 100);
const H234_MARGIN_BOTTOM = heightPercentageToDP((7 / 720) * 100);

export const HEADER_HEIGHT = isIPhoneX
  ? HEADER_IPHONE_X_HEIGHT
  : HEADER_MAX_HEIGHT;

const CUSTOM_STYLES = {
  p: {
    color: '#000',
    fontSize: fontSize.normal,
    lineHeight: fontSize.normal * 1.53,
    fontFamily: 'Roboto-Regular',
    marginBottom: P_MARGIN_BOTTOM,
    marginHorizontal: MARGIN_HORIZONTAL,
  },
  br: {
    display: 'none',
  },
  strong: {
    // lineHeight: 32,
    fontFamily: 'Roboto-Medium',
  },
  h1: {
    marginBottom: H1_MARGIN_BOTTOM,
    color: '#000',
    marginHorizontal: MARGIN_HORIZONTAL,
    fontFamily: 'OpenSans-Semibold',
    fontSize: fontSize.fontSize20,
    lineHeight: fontSize.fontSize20 * 1.15,
  },
  h2: {
    marginBottom: H234_MARGIN_BOTTOM,
    color: '#000',
    marginHorizontal: MARGIN_HORIZONTAL,
    fontFamily: 'OpenSans-Semibold',
    fontSize: fontSize.fontSize20,
    lineHeight: fontSize.fontSize20 * 1.15,
  },

  h3: {
    marginBottom: H234_MARGIN_BOTTOM,
    fontFamily: 'OpenSans-Semibold',
    fontSize: fontSize.fontSize20,
    lineHeight: fontSize.fontSize20 * 1.15,
    marginHorizontal: MARGIN_HORIZONTAL,
  },
  h4: {
    marginBottom: H234_MARGIN_BOTTOM,
    marginHorizontal: MARGIN_HORIZONTAL,
    fontFamily: 'OpenSans-Semibold',
    fontSize: fontSize.fontSize20,
    lineHeight: fontSize.fontSize20 * 1.15,
  },
  ul: {
    paddingLeft: 5,
  },
  li: {
    lineHeight: fontSize.normal * 1.53,
    color: '#000',
    fontSize: fontSize.normal,
  },
  a: {
    fontSize: fontSize.normal,
  },

  figure: {
    marginHorizontal: MARGIN_HORIZONTAL,
    marginVertical: FIGURE_MARGIN_VERTICAL,
  },

  img: {
    marginBottom: 5,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  contentContainerStyle: {
    paddingTop:
      Platform.OS === 'ios'
        ? CONTENT_IOS_PADDING_TOP
        : CONTENT_ANDROID_PADDING_TOP,
  },

  titleStyle: {
    color: '#000000',
    paddingHorizontal: MARGIN_HORIZONTAL,
    fontFamily: 'OpenSans-Semibold',
    fontSize: fontSize.fontSize20,
    lineHeight: fontSize.fontSize20 * 1.15,
  },

  creator: {
    fontSize: fontSize.fontSize14,
    color: '#000000',
    lineHeight: fontSize.fontSize14 * 1.21,
  },

  info: {
    flexDirection: 'row',
    paddingHorizontal: MARGIN_HORIZONTAL,
    flexWrap: 'wrap',
    paddingTop: H234_MARGIN_BOTTOM,
    paddingBottom: H234_MARGIN_BOTTOM,
  },
});

export {CUSTOM_STYLES};

export default styles;
