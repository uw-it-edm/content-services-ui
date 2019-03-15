import { isNullOrUndefined } from '../../../core/util/node-utilities';
import { CustomTextItem } from '../../../core/shared/model/config';
import { CustomizedText } from './customized-text';

export class CustomTextUtilities {
  public static getCustomText(
    customText: Map<string, CustomTextItem>,
    id: string,
    defaultValue: string
  ): CustomizedText {
    let description;
    let label = defaultValue;
    let isCustom = false;

    if (!isNullOrUndefined(customText)) {
      if (!isNullOrUndefined(id)) {
        const customTextItem = customText[id];

        if (isNullOrUndefined(customTextItem)) {
          label = defaultValue;
        } else {
          description = customTextItem.description;
          label = customTextItem.label;
          isCustom = true;
        }
      }
    }

    return new CustomizedText(label, description, isCustom);
  }
}
