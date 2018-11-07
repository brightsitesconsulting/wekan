const subManager = new SubsManager();
const { calculateIndexData, enableClickOnTouch } = Utils;

BlazeComponent.extendComponent({
  mixins() {
    return [Mixins.InfiniteScrolling, Mixins.PerfectScrollbar];
  },

  calculateNextPeak() {
    const cardElement = this.find('.js-card-details');
    if (cardElement) {
      const altitude = cardElement.scrollHeight;
      this.callFirstWith(this, 'setNextPeak', altitude);
    }
  },

  reachNextPeak() {
    const activitiesComponent = this.childComponents('activities')[0];
    activitiesComponent.loadNextPage();
  },

  onCreated() {
    this.currentBoard = Boards.findOne(Session.get('currentBoard'));
    this.isLoaded = new ReactiveVar(false);
    const boardBody =  this.parentComponent().parentComponent();
    //in Miniview parent is Board, not BoardBody.
    if (boardBody !== null) {
      boardBody.showOverlay.set(true);
      boardBody.mouseHasEnterCardDetails = false;
    }
    this.calculateNextPeak();

    Meteor.subscribe('unsaved-edits');
  },

  isWatching() {
    const card = this.currentData();
    return card.findWatcher(Meteor.userId());
  },

  hiddenSystemMessages() {
    return Meteor.user().hasHiddenSystemMessages();
  },

  canModifyCard() {
    return Meteor.user() && Meteor.user().isBoardMember() && !Meteor.user().isCommentOnly();
  },

  scrollParentContainer() {
    const cardPanelWidth = 510;
    const bodyBoardComponent = this.parentComponent().parentComponent();
    //On Mobile View Parent is Board, Not Board Body. I cant see how this funciton should work then.
    if (bodyBoardComponent === null) return;
    const $cardView = this.$(this.firstNode());
    const $cardContainer = bodyBoardComponent.$('.js-swimlanes');
    const cardContainerScroll = $cardContainer.scrollLeft();
    const cardContainerWidth = $cardContainer.width();

    const cardViewStart = $cardView.offset().left;
    const cardViewEnd = cardViewStart + cardPanelWidth;

    let offset = false;
    if (cardViewStart < 0) {
      offset = cardViewStart;
    } else if (cardViewEnd > cardContainerWidth) {
      offset = cardViewEnd - cardContainerWidth;
    }

    if (offset) {
      bodyBoardComponent.scrollLeft(cardContainerScroll + offset);
    }

    //Scroll top
    const cardViewStartTop = $cardView.offset().top;
    const cardContainerScrollTop = $cardContainer.scrollTop();
    let topOffset = false;
    if(cardViewStartTop < 0){
      topOffset = 0;
    } else if(cardViewStartTop - cardContainerScrollTop > 100) {
      topOffset = cardViewStartTop - cardContainerScrollTop - 100;
    }
    if(topOffset !== false) {
      bodyBoardComponent.scrollTop(topOffset);
    }

  },

  presentParentTask() {
    let result = this.currentBoard.presentParentTask;
    if ((result === null) || (result === undefined)) {
      result = 'no-parent';
    }
    return result;
  },

  linkForCard() {
    const card = this.currentData();
    let result = '#';
    if (card) {
      const board = Boards.findOne(card.boardId);
      if (board) {
        result = FlowRouter.url('card', {
          boardId: card.boardId,
          slug: board.slug,
          cardId: card._id,
        });
      }
    }
    return result;
  },

  onRendered() {
    if (!Utils.isMiniScreen()){
      Meteor.setTimeout(() => {
        this.scrollParentContainer();
      }, 500);
    }
    const $checklistsDom = this.$('.card-checklist-items');

    this.enableOverlay();

    $checklistsDom.sortable({
      tolerance: 'pointer',
      helper: 'clone',
      handle: '.checklist-title',
      items: '.js-checklist',
      placeholder: 'checklist placeholder',
      distance: 7,
      start(evt, ui) {
        ui.placeholder.height(ui.helper.height());
        EscapeActions.executeUpTo('popup-close');
      },
      stop(evt, ui) {
        let prevChecklist = ui.item.prev('.js-checklist').get(0);
        if (prevChecklist) {
          prevChecklist = Blaze.getData(prevChecklist).checklist;
        }
        let nextChecklist = ui.item.next('.js-checklist').get(0);
        if (nextChecklist) {
          nextChecklist = Blaze.getData(nextChecklist).checklist;
        }
        const sortIndex = calculateIndexData(prevChecklist, nextChecklist, 1);

        $checklistsDom.sortable('cancel');
        const checklist = Blaze.getData(ui.item.get(0)).checklist;

        Checklists.update(checklist._id, {
          $set: {
            sort: sortIndex.base,
          },
        });
      },
    });

    // ugly touch event hotfix
    enableClickOnTouch('.card-checklist-items .js-checklist');

    const $subtasksDom = this.$('.card-subtasks-items');

    $subtasksDom.sortable({
      tolerance: 'pointer',
      helper: 'clone',
      handle: '.subtask-title',
      items: '.js-subtasks',
      placeholder: 'subtasks placeholder',
      distance: 7,
      start(evt, ui) {
        ui.placeholder.height(ui.helper.height());
        EscapeActions.executeUpTo('popup-close');
      },
      stop(evt, ui) {
        let prevChecklist = ui.item.prev('.js-subtasks').get(0);
        if (prevChecklist) {
          prevChecklist = Blaze.getData(prevChecklist).subtask;
        }
        let nextChecklist = ui.item.next('.js-subtasks').get(0);
        if (nextChecklist) {
          nextChecklist = Blaze.getData(nextChecklist).subtask;
        }
        const sortIndex = calculateIndexData(prevChecklist, nextChecklist, 1);

        $subtasksDom.sortable('cancel');
        const subtask = Blaze.getData(ui.item.get(0)).subtask;

        Subtasks.update(subtask._id, {
          $set: {
            subtaskSort: sortIndex.base,
          },
        });
      },
    });

    // ugly touch event hotfix
    enableClickOnTouch('.card-subtasks-items .js-subtasks');

    function userIsMember() {
      return Meteor.user() && Meteor.user().isBoardMember();
    }

    // Disable sorting if the current user is not a board member
    this.autorun(() => {
      if ($checklistsDom.data('sortable')) {
        $checklistsDom.sortable('option', 'disabled', !userIsMember());
      }
      if ($subtasksDom.data('sortable')) {
        $subtasksDom.sortable('option', 'disabled', !userIsMember());
      }
    });
  },

  enableOverlay() {
    const parentComponent =  this.parentComponent().parentComponent();
    if (parentComponent === null) return;
    parentComponent.showOverlay.set(true);
    parentComponent.mouseHasEnterCardDetails = true;
  },

  onDestroyed() {
    const parentComponent =  this.parentComponent().parentComponent();
    //on mobile view parent is Board, not board body.
    if (parentComponent === null) return;
    parentComponent.showOverlay.set(false);
  },

  events() {
    const events = {
      [`${CSSEvents.transitionend} .js-card-details`]() {
        this.isLoaded.set(true);
      },
      [`${CSSEvents.animationend} .js-card-details`]() {
        this.isLoaded.set(true);
      },
    };

    return [{
      ...events,
      'click .js-close-card-details' () {
        Utils.goBoardId(this.data().boardId);
      },
      'click .js-open-card-details-menu': Popup.open('cardDetailsActions'),
      'submit .js-card-description' (evt) {
        evt.preventDefault();
        const description = this.currentComponent().getValue();
        this.data().setDescription(description);
      },
      'submit .js-card-details-title' (evt) {
        evt.preventDefault();
        const title = this.currentComponent().getValue().trim();
        if (title) {
          this.data().setTitle(title);
        }
      },
      'submit .js-card-details-assigner'(evt) {
        evt.preventDefault();
        const assigner = this.currentComponent().getValue().trim();
        if (assigner) {
          this.data().setAssignedBy(assigner);
        }
      },
      'submit .js-card-details-requester'(evt) {
        evt.preventDefault();
        const requester = this.currentComponent().getValue().trim();
        if (requester) {
          this.data().setRequestedBy(requester);
        }
      },
      'click .js-member': Popup.open('cardMember'),
      'click .js-add-members': Popup.open('cardMembers'),
      'click .js-add-labels': Popup.open('cardLabels'),
      'click .js-received-date': Popup.open('editCardReceivedDate'),
      'click .js-start-date': Popup.open('editCardStartDate'),
      'click .js-due-date': Popup.open('editCardDueDate'),
      'click .js-end-date': Popup.open('editCardEndDate'),
      'click #toggleButton'() {
        Meteor.call('toggleSystemMessages');
      },
    }];
  },
}).register('flowzCardDetails');
