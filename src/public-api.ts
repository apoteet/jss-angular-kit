/*
 * Public API Surface of jss-angular-kit
 */

import { XcModule } from './lib/xc.module';
import * as types from './lib/data/types';
import { MobileDetectionService } from './lib/services/mobile-detection.service';
import { SitecoreDataService } from './lib/services/sitecore-data.service';
import { WindowEventService } from './lib/services/window-event.service';

export {
    XcModule,
    types,
    MobileDetectionService,
    SitecoreDataService,
    WindowEventService,
};
