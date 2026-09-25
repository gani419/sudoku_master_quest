import mobileAds, {
  RewardedAd,
  RewardedAdEventType,
  InterstitialAd,
  AdEventType,
  MaxAdContentRating,
  TestIds,
} from 'react-native-google-mobile-ads';
import {
  ADMOB_BANNER_ID,
  ADMOB_REWARDED_TIMER_ID,
  ADMOB_REWARDED_BONUS_ID,
  ADMOB_INTERSTITIAL_ID,
} from '@env';

// Enforce Child/Family-safe & PG rating across all ad requests
mobileAds()
  .setRequestConfiguration({
    maxAdContentRating: MaxAdContentRating.PG,
    tagForChildDirectedTreatment: false,
    tagForUnderAgeOfConsent: false,
  })
  .then(() => {
    return mobileAds().initialize();
  })
  .catch((err) => {
    console.log('[AdMob] Init note:', err);
  });

// Fallback to official Google Test IDs if .env values are missing/placeholder
const BANNER_AD_UNIT = ADMOB_BANNER_ID || TestIds.BANNER;
const REWARDED_TIMER_UNIT = ADMOB_REWARDED_TIMER_ID || TestIds.REWARDED;
const REWARDED_BONUS_UNIT = ADMOB_REWARDED_BONUS_ID || TestIds.REWARDED;
const INTERSTITIAL_UNIT = ADMOB_INTERSTITIAL_ID || TestIds.INTERSTITIAL;

export class AdService {
  private static gamesCompletedSinceLastInterstitial = 0;
  private static timerRewardedAd: RewardedAd | null = null;
  private static bonusRewardedAd: RewardedAd | null = null;
  private static hintRewardedAd: RewardedAd | null = null;
  private static interstitialAd: InterstitialAd | null = null;

  public static getBannerAdUnitId(): string {
    return BANNER_AD_UNIT;
  }

  // Preload Rewarded Ads for instantaneous playback
  public static initAds() {
    this.loadTimerRewardedAd();
    this.loadBonusRewardedAd();
    this.loadHintRewardedAd();
    this.loadInterstitialAd();
  }

  private static loadTimerRewardedAd() {
    try {
      this.timerRewardedAd = RewardedAd.createForAdRequest(REWARDED_TIMER_UNIT, {
        requestNonPersonalizedAdsOnly: false,
      });
      this.timerRewardedAd.load();
    } catch (e) {
      console.log('[AdMob] Error loading timer ad:', e);
    }
  }

  private static loadBonusRewardedAd() {
    try {
      this.bonusRewardedAd = RewardedAd.createForAdRequest(REWARDED_BONUS_UNIT, {
        requestNonPersonalizedAdsOnly: false,
      });
      this.bonusRewardedAd.load();
    } catch (e) {
      console.log('[AdMob] Error loading bonus ad:', e);
    }
  }

  private static loadHintRewardedAd() {
    try {
      this.hintRewardedAd = RewardedAd.createForAdRequest(REWARDED_TIMER_UNIT, {
        requestNonPersonalizedAdsOnly: false,
      });
      this.hintRewardedAd.load();
    } catch (e) {
      console.log('[AdMob] Error loading hint ad:', e);
    }
  }

  private static loadInterstitialAd() {
    try {
      this.interstitialAd = InterstitialAd.createForAdRequest(INTERSTITIAL_UNIT, {
        requestNonPersonalizedAdsOnly: false,
      });
      this.interstitialAd.load();
    } catch (e) {
      console.log('[AdMob] Error loading interstitial:', e);
    }
  }

  /**
   * Shows a rewarded ad to unlock a Smart Hint.
   */
  public static showRewardedAdForHint(
    onRewardEarned: () => void,
    onFallbackPass: () => void,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.hintRewardedAd || !this.hintRewardedAd.loaded) {
        onFallbackPass();
        this.loadHintRewardedAd();
        resolve(false);
        return;
      }

      let rewardGranted = false;

      const unsubscribeEarned = this.hintRewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          rewardGranted = true;
          onRewardEarned();
        },
      );

      const unsubscribeClosed = this.hintRewardedAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          unsubscribeEarned();
          unsubscribeClosed();
          this.loadHintRewardedAd();
          resolve(rewardGranted);
        },
      );

      this.hintRewardedAd.show();
    });
  }

  /**
   * Shows a rewarded ad to grant +X:00 minutes extra time.
   * If user is offline or ad fails to load, gracefully grants an Emergency Free Pass.
   */
  public static showRewardedAdForTimeExtension(
    onRewardEarned: () => void,
    onFallbackPass: () => void,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.timerRewardedAd || !this.timerRewardedAd.loaded) {
        console.log('[AdMob] Ad not ready or offline - granting free emergency pass');
        onFallbackPass();
        this.loadTimerRewardedAd();
        resolve(false);
        return;
      }

      let rewardGranted = false;

      const unsubscribeLoaded = this.timerRewardedAd.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {},
      );

      const unsubscribeEarned = this.timerRewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          rewardGranted = true;
          onRewardEarned();
        },
      );

      const unsubscribeClosed = this.timerRewardedAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          unsubscribeLoaded();
          unsubscribeEarned();
          unsubscribeClosed();
          this.loadTimerRewardedAd();
          resolve(rewardGranted);
        },
      );

      const unsubscribeError = this.timerRewardedAd.addAdEventListener(
        AdEventType.ERROR,
        () => {
          unsubscribeLoaded();
          unsubscribeEarned();
          unsubscribeClosed();
          unsubscribeError();
          onFallbackPass();
          this.loadTimerRewardedAd();
          resolve(false);
        },
      );

      this.timerRewardedAd.show();
    });
  }

  /**
   * Shows a rewarded ad to unlock the Bonus Boss Stage.
   */
  public static showRewardedAdForBonusStage(
    onRewardEarned: () => void,
    onFallbackPass: () => void,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.bonusRewardedAd || !this.bonusRewardedAd.loaded) {
        onFallbackPass();
        this.loadBonusRewardedAd();
        resolve(false);
        return;
      }

      let rewardGranted = false;

      const unsubscribeEarned = this.bonusRewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          rewardGranted = true;
          onRewardEarned();
        },
      );

      const unsubscribeClosed = this.bonusRewardedAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          unsubscribeEarned();
          unsubscribeClosed();
          this.loadBonusRewardedAd();
          resolve(rewardGranted);
        },
      );

      this.bonusRewardedAd.show();
    });
  }

  /**
   * Shows an interstitial ad between games only when cooldown is met (max 1 every 3 games)
   * Guaranteed never to play mid-game.
   */
  public static showInterstitialIfEligible() {
    this.gamesCompletedSinceLastInterstitial++;
    if (this.gamesCompletedSinceLastInterstitial >= 3) {
      if (this.interstitialAd && this.interstitialAd.loaded) {
        this.interstitialAd.show();
        this.gamesCompletedSinceLastInterstitial = 0;
        this.loadInterstitialAd();
      }
    }
  }
}
