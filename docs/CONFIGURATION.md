This page will describe each configuration section available for the application.

# Content Configuration

TBD

# Custom Text

| Key        | Type           | Description  | Default Value | 
| :------------- |:-------------| :-----| :-----| 
| showMoreFacetsLabel | string | The label of "show more facets" button | "more"|
| showLessFacetsLabel | string | The label of "show less facets" button | "less"|
| searchBox.search | string | The label of "Search" button | "Search"|
| timestamp-picker.error.required | string | Error message displayed when the field is required and not set | "You must enter a value"|
| timestamp-picker.error.invalidDate | string | Error message when an invalid date is entered | "Please enter a valid date."|
| timestamp-picker.error.outsideElasticsearchDateRange | string | Error message displayed when date is outside Elasticsearch's accepted values | "The year must be a valid date between 1653 and 2285"|
| facet.${facetKey}.${facetValue} | string | The label that'd be use for a specific facet value | ${facetValue}|
| unsavedChangesMessage | string | The message displayed when leaving a form with unsaved changes | "You have unsaved changes. Press Cancel to go back and save these changes, or OK and your changes will be lost."|
| error.content.update.${errorCode} | string | Customized error message for the specified error code | |

      "customText": {
        "facet.metadata.IsRegIdPresent.1":{
          "label": "Yes",
          "description": "Show documents with Employee ID"
        },
        "facet.metadata.IsRegIdPresent.0":{
          "label": "No",
          "description": "Show documents without Employee ID"
        },
        "error.content.update.401": {
            "label": "You are not authorized to add documents with this Document Name"
        },"unsavedChangesMessage": {
            "label": "Click OK to lose your changes."
        }
      }

# Pages
## Search Page

| Key        | Type           | Description  | Default Value | 
| :------------- |:-------------| :-----| :-----| 
| pageName | string | Name of the page | |
| theme | string | Main Css wrapper class  | uw-default |
| searchStateInURL | boolean | Should the search be saved in the url ( allow for shareable search ) | false |
| displayDocumentLabelField | boolean | Add Label in list of columns | false |
| disableUploadNewDocument | boolean | Disable display of button to upload new documents | false |
| enableDisplaySearch | boolean | Enable display of button to display all documents of search results | false |
| enableBulkUpdate | boolean | Enable the 'Bulk Update' button to display | false |
| fieldsToDisplay | List | See [Fields](#fields) | |
| fieldReferencesToDisplay | List[string] | List of field keys from 'availableFields' to display. | |
| searchDaterangeConfig | List | See [Search Date Range](#search-date-range) | |
| facetsConfig | List | See [Facets](#facets) | |
| autocompleteConfig | List | See [Auto Complete](#auto-complete) | |

### Search Date Range
This component utilizes the [ngx-daterangepicker-material](https://github.com/fetrarij/ngx-daterangepicker-material). 

Either **showCalendar**, **showRelativeRange**, or both are required to be true.

| Key        | Type           | Description  | Default Value | 
| :------------- |:-------------| :-----| :-----| 
| active      | boolean | enables the search daterange component | false |
| filterKey      | string      |  the key for the search filter to filter on  | |
| filterLabel | string      | the label for the search filter | |
| showCalendar | boolean | enables the calendar date picker | true |
| showClearButton | boolean      | enables the button to remove a selected date range filter | true |
| showRelativeRange | boolean | enables the relative range picker ( "Today", "Yesterday", "Last 7 Days", etc.) | false |
| placeholder | string      | the placeholder & aria text for the field | |
| displayRangeLabelInsteadOfDates | boolean      | enables displaying the relative range term, instead of the date range when selected ("Last 7 Days" instead of "9/20/2018 - 9/27/2018") | false |
| showDropdowns | boolean      | enables month and year drop down in calendar view | false |

    "searchDaterangeConfig": {
        "active": true,
        "filterKey":"metadata.ReceivedDate.raw",
        "filterLabel":"ReceivedDate",
        "showCalendar": true,
        "showClearButton": true,
        "showRelativeRange": true,
        "placeholder": "Choose Received Date",
        "displayRangeLabelInsteadOfDates":true,
        "showDropdowns":true
      }
### Facets

| Key        | Type           | Description  | Default Value | 
| :------------- |:-------------| :-----| :-----| 
| key | string | The name of the facet| |
| label | string |What will be displayed to the user  | |
| order | string | sort order | "asc" (ascending) |
| size  | integer | initial number of facet values to show | 5 |
| maxSize | integer | maximum number of facet values to sow | 5 |
| dataApiValueType | string | optional data api value type for this facet | |
| dataApiLabelPath | string | optional path to the label field for the facet | |

     "facetsConfig": {
        "active": true,
        "facets": {
          "metadata.Unit": {
            "key": "metadata.Unit.raw",
            "label": "Unit",
            "order": "asc",
            "size": 5,
            "maxSize": 50,
            "dataApiValueType": "ap-document-type",
            "dataApiLabelPath":"label"
          }
      }

### Auto Complete

| Key        | Type           | Description  | Default Value | 
| :------------- |:-------------| :-----| :-----| 
| type | string | Entity to auto complete on: studentAutoComplete, personAutoComplete | |
| filterKey | string | Metadata key for the field to auto complete on | |
| filerLabel | string | Plain text to be displayed | |
| optionDisplayConfig | Object | Configure how the option is displayed in the auto-complete dropdown. (ie. 'displayRegisteredNames' for student and person auto complete) ||

    "autocompleteConfig": {
        "type": "personAutocomplete",
        "filterKey": "metadata.RegId",
        "filterLabel": "Employee"
      }

## Create Page

| Key        | Type           | Description  | Default Value | 
| :------------- |:-------------| :-----| :-----| 
| pageName | string | Name of the page | |
| theme | string | Main Css wrapper class  | uw-default |
| fieldsToDisplay | List[Fields] | List of available fields on the page. See [Fields](#fields) | |
| fieldReferencesToDisplay | List[string] | List of field keys from 'availableFields' to use in create.  | |
| buttons | List<ButtonConfig> | List of available buttons on the page | |
| viewPanel | boolean | Show the Document| |

## Edit Page

| Key        | Type           | Description  | Default Value | 
| :------------- |:-------------| :-----| :-----| 
| pageName | string | Name of the page | |
| theme | string | Main Css wrapper class  | uw-default |
| fieldsToDisplay | List[Fields] | List of available fields on the page. See [Fields](#fields) | |
| fieldReferencesToDisplay | List[string] | List of field keys from 'availableFields' to edit. | |
| buttons | List<ButtonConfig> | List of available buttons on the page | |
| viewPanel | boolean | Show the Document| |
| disableFileReplace | boolean | Whether to disable the ability to replace an uploaded file of the document.| false |
| allowPageByPageMode | boolean | Enable button to toggle between page-by-page and scrolling mode in the document preview panel | false |

## Bulk Edit Page

| Key        | Type           | Description  | Default Value | 
| :------------- |:-------------| :-----| :-----| 
| pageName | string | Name of the page | |
| theme | string | Main Css wrapper class  | uw-default |
| fieldsToDisplay | List[Fields] | List of fields to bulk edit. See [Fields](#fields) | |
| fieldReferencesToDisplay | List[string] | List of field keys from 'availableFields' to bulk edit. | |
| resultsTableFieldsToDisplay | List[Fields] | List of fields display on the results table of bulk edit screen. See [Fields](#fields) | same value as 'fieldsToDisplay' |
| resultsTableFieldKeysToDisplay | List[string] | List of field keys from 'availableFields' display on the results table of bulk edit screen. | |


## Fields 

| Key        | Type           | Description  | Default Value | 
| :------------- |:-------------| :-----| :-----| 
| key | string | The name of the field in the backend | |
| label | string |What will be displayed to the user  | |
| dataType | string |Type of data used in the backend (string, number, date)   | string |
| displayType | string |Type of data displayed to the user (select, date, checkbox, student, person, string, currency, number, filter-select, multi-select)  | string |
| required | boolean |  | false |
| disabled | boolean |  | false |
| options | FieldOption[] | List of options when hardcoding a list of available options. See [Field Option](#field-options) | |
| dynamicSelectConfig | DynamicSelectConfig | Configuration to allow having a select box backed by data-api. See [Dynamic Select Config](#dynamic-select-config)| |
| personResourceConfig | PersonResourceConfig | Configuration for fields that load person resources. See [Person Resource Config](#person-resource-config)| |
| checkboxOptions | CheckboxOptions | Configuration for when the field is a checkbox. See [Checkbox Options](#checkbox-options) | |
| sortable | boolean | Show the Document| true |

### Field Options

| Key        | Type           | Description  | Default Value | 
| :------------- |:-------------| :-----| :-----| 
| value | string | The value that will be stored in the backend | |
| label | string |The label that will be displayed to the user  | |

### Dynamic Select Config

| Key        | Type           | Description  | Default Value | 
| :------------- |:-------------| :-----| :-----| 
| type | string | The type of document requested in data-api | |
| labelPath | string | The field you want to use as display value  | |
| parentFieldConfig | ParentFieldConfig | Configuration when available options should be driven by a parent field   | null |

### Person Resource Config

| Key        | Type           | Description  | Default Value | 
| :------------- |:-------------| :-----| :-----| 
| displayRegisteredName | boolean | Whether to display the person's registered name instead of the default preferred name. | |

### ParentFieldConfig

| Key        | Type           | Description  | Default Value | 
| :------------- |:-------------| :-----| :-----| 
| key | string | The key of the field that should be the parent | |
| parentType | string | The type of document of the parent requested in data-api  | |


### Checkbox Options

| Key        | Type           | Description  | Default Value | 
| :------------- |:-------------| :-----| :-----| 
| checkedValue | string | The value that will be stored in the backend when the checkbox is selected | |
| uncheckedValue | string |The value that will be stored in the backend when the checkbox is not selected. Can be omitted to not store an unchecked value in the backend   | |

# Warning Header Message
| Key        | Type           | Description  | Default Value | 
| :------------- |:-------------| :-----| :-----| 
| warningHeaderMessage | string | Optional plain text to be displayed as sub header | |


# Full Configuration Example


[Demo Profile](https://raw.githubusercontent.com/uw-it-edm/content-services-ui/develop/e2e/mocks/profile-api/demo.json)
